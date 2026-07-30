<?php
/**
 * DigitaPrint — Endpoint de envio do formulário de contacto.
 * Recebe o POST de contactos.html e envia um email para o destinatário abaixo.
 */

declare(strict_types=1);

// ------------------------------------------------------------------
// Configuração
// ------------------------------------------------------------------
const DESTINATARIO   = 'info@digitaprint.pt';
const REMETENTE_EMAIL = 'noreply@digitaprint.pt'; // deve pertencer ao mesmo domínio do site (SPF/DKIM)
const REMETENTE_NOME  = 'Site DigitaPrint';

// reCAPTCHA v3 — gere as chaves em https://www.google.com/recaptcha/admin
// (escolha "reCAPTCHA v3"). A Secret Key é privada: nunca a exponha no HTML/JS.
const RECAPTCHA_SECRET_KEY = 'RECAPTCHA_SECRET_KEY_AQUI';
const RECAPTCHA_MIN_SCORE  = 0.5; // 0.0 (bot) a 1.0 (humano) — ajuste conforme o volume de spam recebido

$servicos = [
  'design'             => 'Design Gráfico',
  'grande-formato'     => 'Impressão Grande Formato',
  'pequeno-formato'    => 'Impressão Pequeno Formato',
  'impressao-uv'       => 'Impressão UV',
  'laser'              => 'Corte e Gravação Laser',
  'decoracao-viatura'  => 'Decoração de Viaturas',
  'decoracao-espaco'   => 'Decoração de Montras e Espaços',
  'textil'             => 'Têxtil Personalizado',
  'brindes'            => 'Brindes Publicitários',
  'outro'              => 'Outro / Não sei ainda',
];

header('Content-Type: application/json; charset=utf-8');

function responder(bool $sucesso, string $mensagem, int $status = 200): void {
  http_response_code($status);
  echo json_encode(['success' => $sucesso, 'message' => $mensagem], JSON_UNESCAPED_UNICODE);
  exit;
}

// ------------------------------------------------------------------
// Verificação do token reCAPTCHA v3 junto da Google
// ------------------------------------------------------------------
function recaptchaValido(string $token): bool {
  // Chave ainda não configurada: não bloqueia o formulário (permite testar
  // o resto do fluxo antes de ativar a proteção).
  if (RECAPTCHA_SECRET_KEY === '' || RECAPTCHA_SECRET_KEY === 'RECAPTCHA_SECRET_KEY_AQUI') {
    return true;
  }

  if ($token === '') {
    return false;
  }

  $query = http_build_query([
    'secret'   => RECAPTCHA_SECRET_KEY,
    'response' => $token,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
  ]);

  $contexto = stream_context_create([
    'http' => ['method' => 'GET', 'timeout' => 5],
  ]);
  $resposta = @file_get_contents('https://www.google.com/recaptcha/api/siteverify?' . $query, false, $contexto);

  // Falha a contactar a Google (rede, timeout, etc.): não bloqueia pedidos
  // legítimos por uma indisponibilidade externa.
  if ($resposta === false) {
    return true;
  }

  $dados = json_decode($resposta, true);

  return ($dados['success'] ?? false) === true
      && ($dados['action'] ?? '') === 'contact'
      && (float) ($dados['score'] ?? 0) >= RECAPTCHA_MIN_SCORE;
}

// ------------------------------------------------------------------
// Apenas POST
// ------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  responder(false, 'Método não permitido.', 405);
}

// ------------------------------------------------------------------
// Honeypot anti-spam — campo "empresa" deve chegar vazio
// ------------------------------------------------------------------
if (!empty($_POST['empresa'] ?? '')) {
  // Bot apanhado: responde como sucesso para não revelar a armadilha, mas não envia nada.
  responder(true, 'Pedido recebido.');
}

// ------------------------------------------------------------------
// Recolha e sanitização dos campos
// Remove quebras de linha para impedir injeção de cabeçalhos de email.
// ------------------------------------------------------------------
function campo(string $chave): string {
  $valor = trim((string) ($_POST[$chave] ?? ''));
  return preg_replace('/[\r\n]+/', ' ', $valor) ?? '';
}

$nome     = campo('nome');
$email    = campo('email');
$telefone = campo('telefone');
$servicoKey = campo('servico');
$mensagem = trim((string) ($_POST['mensagem'] ?? ''));
$recaptchaToken = campo('recaptcha_token');

// ------------------------------------------------------------------
// Validação
// ------------------------------------------------------------------
$erros = [];

if (mb_strlen($nome) < 2) {
  $erros[] = 'Nome inválido.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $erros[] = 'Email inválido.';
}
if (!array_key_exists($servicoKey, $servicos)) {
  $erros[] = 'Serviço inválido.';
}
if (mb_strlen(trim($mensagem)) < 10) {
  $erros[] = 'Mensagem demasiado curta.';
}
if (!recaptchaValido($recaptchaToken)) {
  $erros[] = 'Não foi possível validar o pedido como humano. Recarregue a página e tente novamente.';
}

if ($erros) {
  responder(false, implode(' ', $erros), 422);
}

$servicoNome = $servicos[$servicoKey];

// ------------------------------------------------------------------
// Construção do email
// ------------------------------------------------------------------
$assunto = '=?UTF-8?B?' . base64_encode("Novo pedido de contacto — {$servicoNome}") . '?=';

$corpo  = "Novo pedido de contacto recebido através do site DigitaPrint:\n\n";
$corpo .= "Nome: {$nome}\n";
$corpo .= "Email: {$email}\n";
$corpo .= "Telefone: " . ($telefone !== '' ? $telefone : '(não indicado)') . "\n";
$corpo .= "Serviço pretendido: {$servicoNome}\n\n";
$corpo .= "Mensagem:\n{$mensagem}\n";

$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . '=?UTF-8?B?' . base64_encode(REMETENTE_NOME) . '?=' . ' <' . REMETENTE_EMAIL . '>';
$headers[] = 'Reply-To: ' . '=?UTF-8?B?' . base64_encode($nome) . '?=' . " <{$email}>";
$headers[] = 'X-Mailer: PHP/' . phpversion();

$enviado = mail(DESTINATARIO, $assunto, $corpo, implode("\r\n", $headers));

if ($enviado) {
  responder(true, 'Obrigado pelo seu contacto! O seu pedido foi enviado com sucesso.');
}

responder(false, 'Não foi possível enviar o seu pedido neste momento. Por favor tente novamente ou contacte-nos por telefone.', 500);
