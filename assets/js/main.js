/* ============================================================
   DigitaPrint — main.js
   Funcionalidades: menu mobile, header scroll, animações,
   filtros da galeria, validação do formulário, scroll suave.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Constantes e utilitários
  ---------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ----------------------------------------------------------
     2. Header — transparente / sólido conforme scroll
  ---------------------------------------------------------- */
  function initHeader() {
    const header = $('.header');
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 60) {
        header.classList.add('header--scrolled');
        header.classList.remove('header--transparent');
      } else {
        header.classList.remove('header--scrolled');
        header.classList.add('header--transparent');
      }
    }

    // Estado inicial
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    // Esconde o header assim que o rodapé entra na área visível, para nunca
    // ficar sobreposto ao conteúdo do rodapé (ex: ícones sociais) em ecrãs
    // onde a altura da janela faz coincidir o fim da página com o topo do ecrã.
    const footer = $('.footer');
    const waBtn  = $('.whatsapp-float');
    if (footer && 'IntersectionObserver' in window) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          header.classList.toggle('header--hide', entry.isIntersecting);
          if (waBtn) waBtn.classList.toggle('whatsapp-float--hide', entry.isIntersecting);
        });
      }, { threshold: 0 });
      footerObserver.observe(footer);
    }
  }

  /* ----------------------------------------------------------
     3. Menu mobile (hamburger)
  ---------------------------------------------------------- */
  function initMobileMenu() {
    const hamburger = $('.nav__hamburger');
    const menu      = $('.nav__menu');
    if (!hamburger || !menu) return;

    function openMenu() {
      hamburger.classList.add('is-open');
      menu.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // impede scroll do body
    }

    function closeMenu() {
      hamburger.classList.remove('is-open');
      menu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = menu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    }

    hamburger.addEventListener('click', toggleMenu);

    // Fechar ao clicar em qualquer link do menu
    $$('.nav__link, .nav__cta', menu).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Fechar com tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ----------------------------------------------------------
     4. Marcar link activo no menu conforme a página actual
  ---------------------------------------------------------- */
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link').forEach(link => {
      const href = (link.getAttribute('href') || '').split('/').pop();
      if (href === currentPath ||
          (currentPath === '' && href === 'index.html') ||
          (currentPath === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     5. Animações de scroll (IntersectionObserver)
  ---------------------------------------------------------- */
  function initScrollReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    // Sem suporte para IntersectionObserver: mostrar tudo
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // observa apenas uma vez
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     6. Filtros da galeria de clientes
  ---------------------------------------------------------- */
  function initFilters() {
    const filterBar    = $('.filter-bar');
    const projectCards = $$('.project-card');
    if (!filterBar || !projectCards.length) return;

    const filterBtns = $$('.filter-btn', filterBar);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Actualizar botão activo
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const category = btn.dataset.filter;

        projectCards.forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     6b. Lightbox da galeria de projetos (clientes.html)
  ---------------------------------------------------------- */
  function initLightbox() {
    const lightbox = $('#lightbox');
    const grid     = $('#projects-grid');
    if (!lightbox || !grid) return;

    const mediaEl    = $('#lightbox-media', lightbox);
    const categoryEl = $('#lightbox-category', lightbox);
    const titleEl    = $('#lightbox-title', lightbox);
    const descEl     = $('#lightbox-desc', lightbox);
    const closeBtn   = $('.lightbox__close', lightbox);
    const prevBtn    = $('.lightbox__nav--prev', lightbox);
    const nextBtn    = $('.lightbox__nav--next', lightbox);

    // Apenas os projetos visíveis no filtro atual entram na navegação
    function visibleCards() {
      return $$('.project-card', grid).filter(card => !card.classList.contains('is-hidden'));
    }

    function renderCard(card) {
      const image = $('.project-card__image', card);
      mediaEl.innerHTML = '';
      if (image) {
        const clone = image.cloneNode(true);
        const badge = $('.project-card__badge', clone);
        if (badge) badge.remove();
        mediaEl.appendChild(clone);
      }
      categoryEl.textContent = ($('.project-card__category', card) || {}).textContent || '';
      titleEl.textContent    = ($('.project-card__title', card) || {}).textContent || '';
      descEl.textContent     = (($('.project-card__desc', card) || {}).textContent || '').trim();
      lightbox.dataset.activeIndex = String(visibleCards().indexOf(card));
    }

    function openLightbox(card) {
      renderCard(card);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function step(direction) {
      const cards = visibleCards();
      if (!cards.length) return;
      const current = Number(lightbox.dataset.activeIndex || 0);
      const nextIndex = (current + direction + cards.length) % cards.length;
      renderCard(cards[nextIndex]);
    }

    $$('.js-lightbox-trigger', grid).forEach(trigger => {
      trigger.addEventListener('click', () => {
        const card = trigger.closest('.project-card');
        if (card) openLightbox(card);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape')    closeLightbox();
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ----------------------------------------------------------
     7. Validação e submissão do formulário de contacto
  ---------------------------------------------------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const messageEl = $('#form-message');

    // Função de validação de email simples
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Mostrar erro num campo
    function setError(field, msg) {
      field.style.borderColor = '#E5007D';
      let errEl = field.parentElement.querySelector('.field-error');
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        errEl.style.cssText = 'display:block;font-size:0.75rem;color:#E5007D;margin-top:0.25rem;font-weight:500;';
        field.parentElement.appendChild(errEl);
      }
      errEl.textContent = msg;
    }

    // Limpar erro num campo
    function clearError(field) {
      field.style.borderColor = '';
      const errEl = field.parentElement.querySelector('.field-error');
      if (errEl) errEl.remove();
    }

    // Limpar erros ao começar a digitar
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => clearError(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Impede o envio nativo; envio real é feito via fetch() abaixo

      let isValid = true;

      const name     = $('#f-name');
      const email    = $('#f-email');
      const phone    = $('#f-phone');
      const service  = $('#f-service');
      const message  = $('#f-message');

      // Limpar erros anteriores
      [name, email, phone, service, message].forEach(clearError);
      if (messageEl) messageEl.className = 'form__message';

      // Validações
      if (!name || name.value.trim().length < 2) {
        setError(name, 'Por favor introduza o seu nome (mínimo 2 caracteres).');
        isValid = false;
      }

      if (!email || !isValidEmail(email.value.trim())) {
        setError(email, 'Por favor introduza um endereço de email válido.');
        isValid = false;
      }

      if (!service || service.value === '') {
        setError(service, 'Por favor selecione o serviço pretendido.');
        isValid = false;
      }

      if (!message || message.value.trim().length < 10) {
        setError(message, 'A mensagem deve ter pelo menos 10 caracteres.');
        isValid = false;
      }

      if (!isValid) {
        if (messageEl) {
          messageEl.textContent = 'Por favor corrija os campos assinalados.';
          messageEl.className = 'form__message error';
        }
        return;
      }

      // Campos válidos — enviar para o endpoint PHP
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      function submitForm() {
        fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        })
          .then(response => response.json().catch(() => ({
            success: false,
            message: 'Resposta inesperada do servidor.'
          })))
          .then(data => {
            if (messageEl) {
              messageEl.textContent = data.message ||
                (data.success ? 'Pedido enviado com sucesso.' : 'Não foi possível enviar o pedido.');
              messageEl.className = 'form__message ' + (data.success ? 'success' : 'error');
            }
            if (data.success) {
              setTimeout(() => {
                form.reset();
                if (messageEl) messageEl.className = 'form__message';
              }, 8000);
            }
          })
          .catch(() => {
            if (messageEl) {
              messageEl.textContent = 'Não foi possível enviar o pedido. Verifique a sua ligação e tente novamente.';
              messageEl.className = 'form__message error';
            }
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
          });
      }

      // reCAPTCHA v3 — gera um token invisível (sem desafio) antes do envio.
      // Se a Site Key não estiver configurada, ou o grecaptcha não carregar
      // (ex: bloqueador de anúncios), o formulário segue sem token e o
      // contact.php decide como lidar com a ausência (ver RECAPTCHA_SECRET_KEY).
      const siteKey = form.dataset.recaptchaSiteKey;
      const tokenField = $('#f-recaptcha-token', form);

      if (siteKey && siteKey !== 'RECAPTCHA_SITE_KEY_AQUI' && window.grecaptcha) {
        grecaptcha.ready(() => {
          grecaptcha.execute(siteKey, { action: 'contact' })
            .then(token => {
              if (tokenField) tokenField.value = token;
              submitForm();
            })
            .catch(submitForm);
        });
      } else {
        submitForm();
      }
    });
  }

  /* ----------------------------------------------------------
     8. Scroll suave para âncoras internas
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.getElementById(anchor.getAttribute('href').slice(1));
        if (target) {
          e.preventDefault();
          const headerHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height')
          ) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     9. Ano automático no rodapé
  ---------------------------------------------------------- */
  function initYear() {
    $$('.js-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ----------------------------------------------------------
     10. Inicialização
  ---------------------------------------------------------- */
  function init() {
    initHeader();
    initMobileMenu();
    initActiveNav();
    initScrollReveal();
    initFilters();
    initLightbox();
    initContactForm();
    initSmoothScroll();
    initYear();
  }

  // Executar após o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
