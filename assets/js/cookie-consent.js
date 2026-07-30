/* ============================================================
   DigitaPrint — Gestor de cookies (implementação própria, sem
   dependências externas — grátis e sob controlo total do site).
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'digitaprint_cookie_consent';

  const CATEGORIES = {
    necessary: {
      label: 'Estritamente necessários',
      desc: 'Essenciais para o funcionamento básico do site (ex: guardar a sua escolha de cookies). Não podem ser desativados.',
      locked: true
    },
    embeds: {
      label: 'Conteúdos incorporados (Google Maps)',
      desc: 'Permitem mostrar o mapa de localização incorporado do Google Maps. Ao ativar, o Google poderá definir os seus próprios cookies.',
      locked: false
    },
    analytics: {
      label: 'Análise',
      desc: 'Ajudam a perceber como os visitantes usam o site. Atualmente não recolhemos dados de análise, mas esta categoria fica pronta para uma futura ferramenta como o Google Analytics.',
      locked: false
    }
  };

  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) { /* localStorage indisponível — ignora silenciosamente */ }
  }

  let currentConsent = loadConsent();

  function acceptedCategory(name) {
    return !!(currentConsent && (currentConsent[name] || CATEGORIES[name].locked));
  }

  function applyConsent(consent) {
    currentConsent = consent;
    saveConsent(consent);
    document.querySelectorAll('.map-embed[data-consent-pending]').forEach(function (wrapper) {
      if (!acceptedCategory('embeds')) return;
      const iframe = wrapper.querySelector('iframe[data-src]');
      if (iframe && !iframe.src) iframe.src = iframe.dataset.src;
      wrapper.removeAttribute('data-consent-pending');
      const placeholder = wrapper.querySelector('.map-embed__consent');
      if (placeholder) placeholder.remove();
    });
    hideBanner();
    hidePreferences();
  }

  /* ----------------------------------------------------------
     Banner principal
  ---------------------------------------------------------- */
  let bannerEl = null;

  function buildBanner() {
    const el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML =
      '<div class="cookie-banner__text">' +
        '<p><strong>Usamos cookies.</strong> Utilizamos cookies essenciais para o site funcionar e, com o seu consentimento, ' +
        'cookies de conteúdos incorporados (mapa) e de análise.</p>' +
      '</div>' +
      '<div class="cookie-banner__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-cookie-action="preferences">Preferências</button>' +
        '<button type="button" class="btn btn--outline btn--sm" data-cookie-action="reject">Rejeitar não essenciais</button>' +
        '<button type="button" class="btn btn--primary btn--sm" data-cookie-action="accept-all">Aceitar tudo</button>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function showBanner() {
    if (!bannerEl) bannerEl = buildBanner();
    requestAnimationFrame(function () {
      bannerEl.classList.add('is-visible');
    });
  }

  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('is-visible');
  }

  /* ----------------------------------------------------------
     Modal de preferências
  ---------------------------------------------------------- */
  let modalEl = null;

  function buildModal() {
    const stored = currentConsent || {};
    const rows = Object.keys(CATEGORIES).map(function (key) {
      const cat = CATEGORIES[key];
      const checked = cat.locked || !!stored[key];
      return (
        '<div class="cookie-modal__row">' +
          '<div class="cookie-modal__row-head">' +
            '<label class="cookie-toggle">' +
              '<input type="checkbox" data-cookie-cat="' + key + '"' +
                (checked ? ' checked' : '') + (cat.locked ? ' disabled' : '') + ' />' +
              '<span class="cookie-toggle__track"><span class="cookie-toggle__thumb"></span></span>' +
            '</label>' +
            '<span class="cookie-modal__row-title">' + cat.label + '</span>' +
          '</div>' +
          '<p class="cookie-modal__row-desc">' + cat.desc + '</p>' +
        '</div>'
      );
    }).join('');

    const el = document.createElement('div');
    el.className = 'cookie-modal-overlay';
    el.innerHTML =
      '<div class="cookie-modal" role="dialog" aria-modal="true" aria-label="Preferências de cookies">' +
        '<button type="button" class="cookie-modal__close" data-cookie-action="close" aria-label="Fechar">&times;</button>' +
        '<h2 class="cookie-modal__title">Preferências de cookies</h2>' +
        '<p class="cookie-modal__intro">Escolha que categorias de cookies aceita. Pode alterar esta escolha a qualquer momento através do link "Preferências de Cookies" no rodapé.</p>' +
        rows +
        '<div class="cookie-modal__actions">' +
          '<button type="button" class="btn btn--outline btn--sm" data-cookie-action="reject">Rejeitar não essenciais</button>' +
          '<button type="button" class="btn btn--outline btn--sm" data-cookie-action="save">Guardar preferências</button>' +
          '<button type="button" class="btn btn--primary btn--sm" data-cookie-action="accept-all">Aceitar tudo</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function showPreferences() {
    if (modalEl) modalEl.remove();
    modalEl = buildModal();
    requestAnimationFrame(function () {
      modalEl.classList.add('is-visible');
    });
  }

  function hidePreferences() {
    if (modalEl) {
      modalEl.classList.remove('is-visible');
      const el = modalEl;
      modalEl = null;
      setTimeout(function () { el.remove(); }, 200);
    }
  }

  /* ----------------------------------------------------------
     Ações
  ---------------------------------------------------------- */
  function acceptAll() {
    applyConsent({ necessary: true, embeds: true, analytics: true });
  }

  function rejectNonEssential() {
    applyConsent({ necessary: true, embeds: false, analytics: false });
  }

  function saveFromModal() {
    if (!modalEl) return;
    const consent = { necessary: true };
    modalEl.querySelectorAll('input[data-cookie-cat]').forEach(function (input) {
      consent[input.dataset.cookieCat] = input.checked;
    });
    applyConsent(consent);
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-cookie-action]');
    if (btn) {
      const action = btn.dataset.cookieAction;
      if (action === 'accept-all') acceptAll();
      else if (action === 'reject') rejectNonEssential();
      else if (action === 'preferences') showPreferences();
      else if (action === 'save') saveFromModal();
      else if (action === 'close') hidePreferences();
      return;
    }

    // Reabrir preferências a partir do link do rodapé
    if (e.target.closest('[data-cookie-preferences]')) {
      showPreferences();
      return;
    }

    // Placeholder do mapa: "Ativar mapa" conta como aceitar só a categoria "embeds"
    if (e.target.closest('[data-consent-load-embed]')) {
      applyConsent(Object.assign({ necessary: true }, currentConsent, { embeds: true }));
    }

    // Fechar modal ao clicar fora da caixa
    if (e.target.classList && e.target.classList.contains('cookie-modal-overlay')) {
      hidePreferences();
    }
  });

  /* ----------------------------------------------------------
     Arranque
  ---------------------------------------------------------- */
  function init() {
    if (currentConsent) {
      applyConsent(currentConsent);
    } else {
      showBanner();
    }
  }

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // API mínima exposta, caso seja útil noutros scripts
  window.DigitaPrintCookieConsent = {
    acceptedCategory: acceptedCategory,
    showPreferences: showPreferences
  };
})();
