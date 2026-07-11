/* 
   ==========================================================================
   SCRIPT PRINCIPAL - INTERACTIVIDAD, VALIDACIÓN Y SEGUIMIENTO - TUTORMATE PRO
   ========================================================================== */

// Configuración global de la marca y enlaces
const siteConfig = {
  brandName: "TutorMate Pro",
  email: "contacto@tutormatepro.com",
  googleCalendarScheduleUrl: "https://calendar.app.google/wH1qNiNfKuJ1xL6u9"
};

// Configuración inicial de Consent Mode de GA4 al cargar el script
(function() {
  const consent = localStorage.getItem('cookies-consent');
  if (consent !== 'accepted') {
    // Desactivar GA4 por defecto hasta que se dé el consentimiento
    window['ga-disable-G-CEQ1MQZWDH'] = true;
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  initCookieConsent();
  initMobileMenu();
  initFaqAccordion();
  initCalendarInterceptors();
  initModalClose();
  initScrollReveal();
  initSeasonalHero();
  initFormHandler();
  initEmailTracker();
});

/* 0. Scroll Reveal Animations */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  reveals.forEach((el) => observer.observe(el));
}

/* 1. Menú Móvil Hamburger */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      
      // Cambia icono de hamburger (abrir/cerrar)
      const isOpen = mobileMenu.classList.contains("open");
      hamburger.innerHTML = isOpen 
        ? `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`
        : `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`;
    });
  }
}

/* 2. Acordeón de FAQs */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll(".faq-btn");

  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");

      // Cierra todos los acordeones
      document.querySelectorAll(".faq-item").forEach((faq) => {
        faq.classList.remove("open");
        const faqButton = faq.querySelector(".faq-btn");
        if (faqButton) faqButton.setAttribute("aria-expanded", "false");
        const answer = faq.querySelector(".faq-answer");
        if (answer) answer.style.maxHeight = null;
      });

      // Si no estaba abierto, lo abre
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        const answer = item.querySelector(".faq-answer");
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      }
    });
  });
}

/* 3. Interceptores de Enlaces de Reserva (Google Calendar) */
function initCalendarInterceptors() {
  const calendarLinks = document.querySelectorAll(".calendar-link");
  const modal = document.getElementById("calendar-modal");
  const emailPlaceholder = document.getElementById("calendar-modal-email");

  // Rellena el email en el modal si existe
  if (emailPlaceholder) {
    emailPlaceholder.textContent = siteConfig.email;
  }

  calendarLinks.forEach((link) => {
    // Si la URL tiene el placeholder o está vacía, activamos el aviso modal
    const isPending = 
      siteConfig.googleCalendarScheduleUrl === "PENDIENTE_DE_CONFIGURAR" || 
      siteConfig.googleCalendarScheduleUrl.includes("MI-LINK-DE-RESERVA");
    
    if (!isPending) {
      link.href = siteConfig.googleCalendarScheduleUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    link.addEventListener("click", (e) => {
      if (isPending) {
        e.preventDefault();
        // Muestra el modal de advertencia de forma limpia
        if (modal) {
          modal.classList.add("open");
        }
      }
    });
  });
}

/* 4. Cierre de Modales */
function initModalClose() {
  const modal = document.getElementById("calendar-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const acceptBtn = document.getElementById("modal-accept-btn");

  const closeModal = () => {
    if (modal) modal.classList.remove("open");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (acceptBtn) acceptBtn.addEventListener("click", closeModal);

  // Cerrar haciendo clic fuera del modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

/* 5. Estacionalidad Dinámica del Hero y CTAs */
function initSeasonalHero() {
  const badge = document.getElementById("hero-badge");
  const title = document.getElementById("hero-title");
  const desc = document.getElementById("hero-desc");
  const ctaBtn = document.getElementById("hero-cta-btn");

  // Desactivar reemplazo automático del Hero para mantener el copy de Ads estable
  return;

  if (!badge || !title || !desc || !ctaBtn) return;

  const currentMonth = new Date().getMonth(); // 0-11 (Ene-Dic)

  let badgeText = "";
  let titleText = "";
  let descText = "";
  let ctaText = "";

  if (currentMonth === 5) {
    // Junio
    badgeText = "Convocatoria ordinaria EBAU / Cierre de curso";
    titleText = "Asegura la nota en Selectividad y el aprobado final";
    descText = "Preparación intensiva de Matemáticas II para la PAU y refuerzo urgente de final de curso en ESO y Bachillerato. No dejes tu plaza de universidad al azar.";
    ctaText = "Reservar valoración inicial";
  } else if (currentMonth === 6) {
    // Julio
    badgeText = "Refuerzo de Verano y Convocatoria Extraordinaria";
    titleText = "Recupera la base de matemáticas este verano";
    descText = "Cursos intensivos de julio para preparar recuperaciones, salvar asignaturas pendientes y afianzar conceptos clave de ESO y Bachillerato.";
    ctaText = "Ver horarios disponibles";
  } else if (currentMonth === 7) {
    // Agosto
    badgeText = "Planificación y Nivelación Pre-Curso";
    titleText = "Nivelación y preparación de matemáticas para el nuevo curso";
    descText = "Diagnóstico personalizado y sesiones de refuerzo en agosto. Prepárate antes de que empiece el curso para evitar el bloqueo con las matemáticas y el cálculo.";
    ctaText = "Ver horarios disponibles";
  } else if (currentMonth === 8) {
    // Septiembre
    badgeText = "Arranque del Curso Escolar y Universitario";
    titleText = "Empieza el curso de matemáticas con paso firme";
    descText = "Acompañamiento semanal premium para ESO, Bachillerato y Universidad. Evita suspensos de última hora con un seguimiento constante y estructurado.";
    ctaText = "Ver horarios disponibles";
  } else {
    // Resto del año
    badgeText = "Refuerzo Académico Continuo";
    titleText = "Matemáticas explicadas paso a paso";
    descText = "Clases particulares online para ESO, Bachillerato, EBAU y Universidad. Método personalizado, pizarra interactiva y seguimiento continuo.";
    ctaText = "Reservar valoración inicial";
  }

  badge.textContent = badgeText;
  if (titleText.includes("paso a paso")) {
    title.innerHTML = titleText.replace("paso a paso", "<em>paso a paso</em>");
  } else {
    title.textContent = titleText;
  }
  desc.textContent = descText;
  ctaBtn.textContent = ctaText;

  // Adaptar el texto del botón final del banner según el mes
  const bottomCalBtn = document.querySelector(".cta-banner .calendar-link");
  if (bottomCalBtn) {
    if (currentMonth === 5) {
      bottomCalBtn.textContent = "Ver horarios de valoración";
    } else if (currentMonth === 6) {
      bottomCalBtn.textContent = "Ver horarios disponibles";
    } else if (currentMonth === 7) {
      bottomCalBtn.textContent = "Ver horarios de agosto";
    } else if (currentMonth === 8) {
      bottomCalBtn.textContent = "Ver horarios de inicio de curso";
    } else {
      bottomCalBtn.textContent = "Ver horarios disponibles";
    }
  }
}

/* 6. Consentimiento de Cookies (Cumplimiento RGPD en España / AEPD) */
function initCookieConsent() {
  const consent = localStorage.getItem('cookies-consent');
  
  if (consent === 'accepted') {
    enableAnalytics();
  } else if (consent === 'rejected') {
    disableAnalytics();
  } else {
    disableAnalytics();
    showCookieBanner();
  }
}

function enableAnalytics() {
  window['ga-disable-G-CEQ1MQZWDH'] = false;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted',
      'ad_user_data': 'granted',
      'ad_personalization': 'granted'
    });
    // Forzar registro de página vista una vez activado
    gtag('config', 'G-CEQ1MQZWDH');
  }
}

function disableAnalytics() {
  window['ga-disable-G-CEQ1MQZWDH'] = true;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }
}

function showCookieBanner() {
  // Crear estilos del banner dinámicamente para evitar contaminar styles.css
  const style = document.createElement('style');
  style.innerHTML = `
    .cookie-banner {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      width: 90%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s;
      opacity: 0;
    }
    .cookie-banner.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .cookie-banner-text h3 {
      font-size: 1.05rem;
      font-family: var(--font-title), sans-serif;
      font-weight: 700;
      color: var(--clr-primary, #002B66);
      margin: 0 0 0.5rem 0;
    }
    .cookie-banner-text p {
      font-size: 0.82rem;
      color: var(--clr-text-muted, #4a5568);
      line-height: 1.5;
      margin: 0;
    }
    .cookie-banner-btns {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      align-items: center;
      flex-wrap: wrap;
    }
    .cookie-banner-btns button {
      padding: 0.55rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cookie-accept {
      background-color: var(--clr-primary, #002B66);
      color: white;
      border: none;
    }
    .cookie-accept:hover {
      background-color: var(--clr-primary-hover, #001f4d);
    }
    .cookie-reject {
      background-color: transparent;
      color: var(--clr-text-light, #718096);
      border: 1px solid var(--clr-border, #E2E8F0);
    }
    .cookie-reject:hover {
      background-color: var(--clr-bg, #f7fafc);
      color: var(--clr-primary, #002B66);
    }
    .cookie-info {
      background-color: transparent;
      color: var(--clr-accent, #002B66);
      border: none;
      text-decoration: underline;
      padding: 0;
      margin-right: auto;
    }
    @media (max-width: 480px) {
      .cookie-banner-btns {
        flex-direction: column;
        align-items: stretch;
      }
      .cookie-info {
        text-align: center;
        margin-bottom: 0.5rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Crear elemento HTML
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  
  // Ajustar ruta según ubicación de la carpeta
  const inNestedFolder = window.location.pathname.includes('/seo/') || window.location.pathname.includes('/mexico/');
  const cookiesPath = inNestedFolder ? '../cookies.html' : 'cookies.html';

  const marketName = window.location.pathname.includes('/mexico/') ? 'México' : 'España';
  banner.innerHTML = `
    <div class="cookie-banner-text">
      <h3>Tu privacidad es importante</h3>
      <p>Utilizo cookies analíticas de Google Analytics para medir de forma anónima las visitas y el rendimiento de mis anuncios en ${marketName}. Puedes aceptar el uso de cookies analíticas o rechazarlas.</p>
    </div>
    <div class="cookie-banner-btns">
      <button class="cookie-info" id="btn-cookie-info">Política de cookies</button>
      <button class="cookie-reject" id="btn-cookie-reject">Rechazar analíticas</button>
      <button class="cookie-accept" id="btn-cookie-accept">Aceptar cookies</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Animar entrada
  setTimeout(() => {
    banner.classList.add('show');
  }, 100);

  // Handlers de botones
  document.getElementById('btn-cookie-info').addEventListener('click', () => {
    window.open(cookiesPath, '_blank');
  });

  document.getElementById('btn-cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookies-consent', 'accepted');
    banner.classList.remove('show');
    enableAnalytics();
    setTimeout(() => banner.remove(), 400);
  });

  document.getElementById('btn-cookie-reject').addEventListener('click', () => {
    localStorage.setItem('cookies-consent', 'rejected');
    banner.classList.remove('show');
    disableAnalytics();
    setTimeout(() => banner.remove(), 400);
  });
}

/* 7. Gestión de Formulario de Contacto (Conversión) */
function initFormHandler() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando solicitud…';
    }

    const formData = {
      access_key: '401af540-d626-4642-b6c7-4ad5344d9a63',
      subject: 'Nuevo mensaje de contacto - TutorMate Pro',
      from_name: 'TutorMate Pro Contacto',
      name: document.getElementById('form-name').value,
      email: document.getElementById('form-email').value,
      phone: document.getElementById('form-phone') ? document.getElementById('form-phone').value : '',
      level: document.getElementById('form-level').value,
      message: document.getElementById('form-message').value
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'No se pudo enviar el formulario');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('No hemos podido enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo. Si continúa el problema, escribe a contacto@tutormatepro.com.');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
      return;
    }

    // Enviar evento de conversión a GA4 si las cookies han sido aceptadas
    const consent = localStorage.getItem('cookies-consent');
    if (consent === 'accepted' && typeof gtag === 'function') {
      gtag('event', 'form_submit', {
        'event_category': 'conversion',
        'event_label': 'Formulario de Contacto Valoración',
        'student_level': formData.level
      });
    }

    // Redirigir a página de gracias
    const inSeoFolder = window.location.pathname.includes('/seo/');
    const graciasUrl = inSeoFolder ? '../gracias.html' : 'gracias.html';
    
    window.location.href = graciasUrl;
  });
}

/* 8. Seguimiento de Clics en Email (Conversión) */
function initEmailTracker() {
  document.addEventListener('click', (e) => {
    const mailLink = e.target.closest('a[href^="mailto:"]');
    if (!mailLink) return;

    const consent = localStorage.getItem('cookies-consent');
    if (consent === 'accepted' && typeof gtag === 'function') {
      gtag('event', 'email_click', {
        'event_category': 'conversion',
        'event_label': mailLink.href.replace('mailto:', '')
      });
    }
  });
}

// Seguimiento de eventos en Google Analytics 4 (GA4) para clics genéricos con data attributes
document.addEventListener('click', function(event) {
  const target = event.target.closest('[data-analytics-event]');
  if (!target || typeof gtag !== 'function') return;

  const consent = localStorage.getItem('cookies-consent');
  if (consent === 'accepted') {
    gtag('event', target.dataset.analyticsEvent, {
      event_category: 'engagement',
      event_label: target.dataset.analyticsLabel || target.textContent.trim(),
      link_url: target.href || ''
    });
  }
});
