# DigitaPrint — Website Institucional

Site institucional da **DigitaPrint**, agência de publicidade, comunicação gráfica, design e produção publicitária.

---

## Estrutura do projeto

```
/
├── index.html          → Página de Início
├── sobre.html          → Página Sobre
├── clientes.html       → Página de Clientes e Projetos
├── digita-print.html   → Página de Serviços
├── contactos.html      → Página de Contactos
├── assets/
│   ├── css/
│   │   └── style.css   → Stylesheet principal (variáveis, layout, componentes)
│   ├── js/
│   │   └── main.js     → JavaScript (menu, scroll, animações, filtros, formulário)
│   └── img/
│       ├── hero-bg.svg         → Placeholder do hero (substituir por hero-bg.jpg)
│       ├── placeholder-1.svg   → Placeholder de referência
│       └── [adicione as imagens reais aqui]
└── README.md
```

---

## Como abrir o projeto

### Opção 1 — Abrir diretamente no browser
Abra o ficheiro `index.html` com qualquer browser moderno (Chrome, Firefox, Edge, Safari).

### Opção 2 — Servidor local (recomendado)
Para evitar restrições de CORS, use um servidor local:

**Com VS Code + Live Server:**
1. Instale a extensão "Live Server" no VS Code.
2. Clique com o botão direito em `index.html` → "Open with Live Server".

**Com Node.js:**
```bash
npx serve .
```

**Com Python:**
```bash
python -m http.server 8080
```

---

## Como substituir as imagens

Todos os placeholders estão assinalados no HTML com comentários:
```html
<!-- SUBSTITUIR: /assets/img/nome-da-imagem.jpg — descrição -->
```

| Ficheiro (a criar)                      | Página / Secção                  | Dimensões |
|-----------------------------------------|----------------------------------|-----------|
| `assets/img/hero-bg.jpg`                | Hero da página de início         | 1920×1080 |
| `assets/img/sobre-equipa.jpg`           | Página Sobre                     | 800×560   |
| `assets/img/projeto-villa-lux.jpg`      | Card — Villa Lux Imobiliária     | 800×600   |
| `assets/img/projeto-seaside.jpg`        | Card — Seaside Braga             | 800×600   |
| `assets/img/projeto-passion.jpg`        | Card — Passion Piscines          | 800×600   |
| `assets/img/projeto-future-fuels.jpg`   | Card — Future Fuels              | 800×600   |
| `assets/img/projeto-campus.jpg`         | Card — Campus da Evangelização   | 800×600   |
| `assets/img/projeto-evento.jpg`         | Card — Evento Local              | 800×600   |
| `assets/img/servico-design.jpg`         | Serviço — Design Gráfico         | 800×600   |
| `assets/img/servico-grande-formato.jpg` | Serviço — Grande Formato         | 800×600   |
| `assets/img/servico-uv.jpg`             | Serviço — Impressão UV           | 800×600   |
| `assets/img/servico-laser.jpg`          | Serviço — Corte Laser            | 800×600   |
| `assets/img/servico-decoracao.jpg`      | Serviço — Decoração              | 800×600   |
| `assets/img/servico-textil.jpg`         | Serviço — Têxtil                 | 800×600   |
| `assets/img/servico-brindes.jpg`        | Serviço — Brindes                | 800×600   |

**Como substituir:** No HTML, substitua o bloco `<div class="img-placeholder ...">` pela tag `<img>` indicada no comentário HTML acima desse bloco.

---

## Como editar textos

Todos os textos estão diretamente nos ficheiros HTML. Abra o ficheiro da página pretendida e edite o conteúdo.

- **Hero / títulos principais** → `class="hero__title"`, `class="page-hero__title"`
- **Serviços** → `digita-print.html`, secções com `id="design"`, `id="laser"`, etc.
- **Contactos** → `contactos.html` e rodapé de todas as páginas
- **Projetos** → `clientes.html`, elementos `<article class="project-card">`

---

## Como alterar cores e estilos

Edite as variáveis CSS no início de `assets/css/style.css`:

```css
:root {
  --color-accent:      #E5007D;   /* Magenta — cor principal */
  --color-accent-dark: #B8005F;   /* Magenta hover */
  --color-dark:        #0D0D0D;   /* Preto / fundo escuro */
  --color-gray-mid:    #555555;   /* Texto secundário */
  /* ... */
}
```

---

## Como funciona o formulário de contacto

O formulário em `contactos.html` envia os dados via `fetch()` (definido em `main.js`,
função `initContactForm()`) para o endpoint `contact.php`, que valida os campos e
envia um email para **info@digitaprint.pt** usando a função `mail()` do PHP.

Inclui um campo honeypot (`#f-empresa`, invisível para utilizadores) e verificação
**reCAPTCHA v3** (invisível, sem desafio de imagens) para reduzir spam.

### Ativar o reCAPTCHA v3
1. Crie umas chaves em [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin/create),
   escolhendo o tipo **reCAPTCHA v3** e registando o domínio `digitaprint.pt`
   (adicione também `localhost` se for testar localmente).
2. Substitua `RECAPTCHA_SITE_KEY_AQUI` em `contactos.html` (aparece 2 vezes: no
   atributo `data-recaptcha-site-key` do `<form>` e no `<script src="...api.js?render=...">`)
   pela **Site Key**.
3. Substitua `RECAPTCHA_SECRET_KEY_AQUI` no topo de `contact.php` pela **Secret Key**.
   Esta chave é privada — nunca a exponha no HTML/JS nem a publique num
   repositório público.
4. Enquanto as chaves não forem substituídas, o formulário funciona normalmente
   sem bloquear ninguém (a verificação fica desativada por omissão).

O `contact.php` rejeita o pedido se a pontuação devolvida pela Google (`score`,
de 0 a 1) for inferior a `RECAPTCHA_MIN_SCORE` (por omissão `0.5`) — ajuste este
valor consoante o volume de spam recebido.

### Requisitos de alojamento
- O servidor tem de suportar **PHP** (a maioria dos alojamentos com cPanel suporta).
- A função `mail()` do PHP tem de estar ativada e configurada no servidor (normal em
  hosting partilhado; em VPS/servidor próprio pode ser necessário configurar um MTA
  como `sendmail` ou `postfix`, ou trocar `mail()` por SMTP com PHPMailer).
- Para reduzir a hipótese de o email cair em spam, o endereço de remetente definido em
  `contact.php` (`REMETENTE_EMAIL`, por omissão `noreply@digitaprint.pt`) deve pertencer
  ao mesmo domínio do site, e idealmente deve existir registos SPF/DKIM configurados
  para o domínio `digitaprint.pt`.

### Alterar o email de destino ou o remetente
Edite as constantes no topo de `contact.php`:
```php
const DESTINATARIO    = 'info@digitaprint.pt';
const REMETENTE_EMAIL  = 'noreply@digitaprint.pt';
const REMETENTE_NOME   = 'Site DigitaPrint';
```

### Testar localmente
O servidor local do Python/`npx serve` **não executa PHP**. Para testar o formulário
localmente, use o servidor embutido do PHP a partir da pasta do projeto:
```bash
php -S localhost:8080
```
Nota: o `mail()` só envia mesmo se houver um servidor de email configurado na máquina;
localmente é normal a chamada falhar mesmo com o código correto — o teste real deve
ser feito já no alojamento final.

---

## Como adicionar o mapa

Em `contactos.html`, o mapa já está incorporado (bloco `.map-embed`) com a morada
Rua Dr. Ferreira do Carmo Nº208, 4990-112 Ponte de Lima. Para alterar a morada,
edite o `src` do `<iframe>`.

---

## Redes sociais

Já configurado no rodapé e em `contactos.html`:
- Facebook: https://www.facebook.com/people/Digitaprint-Ponte-de-Lima/100057131333283/
- Instagram: https://www.instagram.com/digitaprint.pt/

---

## Tecnologias

- **HTML5** — semântico e acessível (roles ARIA, labels, alt)
- **CSS3** — variáveis CSS, Flexbox, Grid, animações
- **JavaScript ES6+** — vanilla, sem frameworks
- **Google Fonts** — Montserrat + Inter
- **IntersectionObserver API** — animações de scroll

---

## Contactos

**DigitaPrint**
📞 258 022 562 | 📱 934 644 974 | ✉ info@digitaprint.pt

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
