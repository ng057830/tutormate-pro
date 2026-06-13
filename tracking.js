/* 
   ==========================================================================
   MÓDULO CENTRAL DE TRACKING Y CONVERSIONES - TUTORMATE PRO
   ========================================================================== */

// Configuración de IDs y variables de entorno para marketing
const TRACKING_CONFIG = {
  // Configuración de Tags (Completar con IDs reales cuando estén configurados)
  GOOGLE_TAG_ID: 'G-CEQ1MQZWDH', // ID del contenedor de Google (gtag.js / GTM)
  GA4_MEASUREMENT_ID: 'G-CEQ1MQZWDH', // ID de Medición de GA4
  GOOGLE_ADS_CONVERSION_ID: 'AW-792175793', // ID de Conversión de Google Ads (ej: AW-XXXXXXXXX)
  
  // Etiquetas de Conversión de Google Ads
  GOOGLE_ADS_LABEL_LEAD: '', // Label para la valoración inicial gratuita
  GOOGLE_ADS_LABEL_WHATSAPP: '', // Label para clics en WhatsApp
  GOOGLE_ADS_LABEL_CHECKOUT_START: '', // Label para inicio de checkout
  GOOGLE_ADS_LABEL_PURCHASE: '', // Label para compra exitosa
  
  // Configuración de Proveedor de Pago y Productos
  // Opciones: 'manual' | 'hotmart' | 'payoneer' | 'wise_manual'
  PAYMENT_PROVIDER: 'manual',
  
  // IDs de productos en Hotmart (para integraciones futuras)
  HOTMART_PRODUCT_ID_PACK_4: '',
  HOTMART_PRODUCT_ID_PACK_8: '',
  HOTMART_PRODUCT_ID_INTENSIVE: '',
  HOTMART_WEBHOOK_SECRET: '',
  
  // Mapeo de Checkouts externos si aplica
  CHECKOUT_URLS: {
    'pack-4': '', // URL de Hotmart/Payoneer para Pack 4 clases
    'pack-8': '', // URL de Hotmart/Payoneer para Pack 8 clases
    'intensivo': '', // URL de Hotmart/Payoneer para Plan Intensivo
    'universidad': '', // URL para planes universitarios
    'urgente': '' // URL para planes de preparación urgente
  }
};

// Inicialización de tracking al cargar el script
(function initTracking() {
  captureMarketingParameters();
  generateLeadId();
  
  // Inicializar Google Ads si está configurado y gtag está listo
  if (TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID && typeof gtag === 'function') {
    gtag('config', TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID);
  }
  
  // Escuchar carga del DOM para autollenar formularios
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDOMTracking);
  } else {
    setupDOMTracking();
  }
})();

/**
 * Captura UTMs y gclid desde la URL y los guarda en localStorage
 */
function captureMarketingParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const marketingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  
  marketingKeys.forEach(key => {
    if (urlParams.has(key)) {
      const val = urlParams.get(key);
      localStorage.setItem(`tmp_${key}`, val);
    }
  });

  // Guardar también la página de entrada inicial si no está registrada
  if (!localStorage.getItem('tmp_landing_page')) {
    localStorage.setItem('tmp_landing_page', window.location.pathname);
  }
  
  // Guardar el referrer si procede de un dominio externo
  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    localStorage.setItem('tmp_referrer', document.referrer);
  }
}

/**
 * Genera un lead_id único por usuario y lo persiste en localStorage
 */
function generateLeadId() {
  let leadId = localStorage.getItem('tmp_lead_id');
  if (!leadId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    leadId = `lead_${timestamp}_${random}`;
    localStorage.setItem('tmp_lead_id', leadId);
  }
  return leadId;
}

/**
 * Configura interceptores en el DOM al cargarse el documento
 */
function setupDOMTracking() {
  autoFillHiddenFields();
  setupClickListeners();
  
  // Detectar y guardar plan seleccionado si viene en la URL (?plan=pack-4)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('plan')) {
    const plan = urlParams.get('plan');
    localStorage.setItem('tmp_selected_plan', plan);
  }
}

/**
 * Busca campos ocultos de marketing en formularios y los completa con la info de localStorage
 */
function autoFillHiddenFields() {
  const fieldsMap = {
    'utm_source': 'tmp_utm_source',
    'utm_medium': 'tmp_utm_medium',
    'utm_campaign': 'tmp_utm_campaign',
    'utm_term': 'tmp_utm_term',
    'utm_content': 'tmp_utm_content',
    'gclid': 'tmp_gclid',
    'lead_id': 'tmp_lead_id',
    'selected_plan': 'tmp_selected_plan',
    'landing_page': 'tmp_landing_page',
    'referrer': 'tmp_referrer'
  };

  // Buscar en todos los formularios
  document.querySelectorAll('form').forEach(form => {
    for (const [fieldName, storageName] of Object.entries(fieldsMap)) {
      let input = form.querySelector(`input[name="${fieldName}"]`);
      
      // Si no existe el input oculto pero la página requiere UTMs, lo creamos
      if (!input && form.id === 'booking-form') {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = fieldName;
        form.appendChild(input);
      }
      
      if (input) {
        let value = localStorage.getItem(storageName) || '';
        
        // Casos especiales para campos que no vienen de localStorage directa
        if (fieldName === 'timestamp') {
          value = new Date().toISOString();
        } else if (fieldName === 'landing_page' && !value) {
          value = window.location.pathname;
        } else if (fieldName === 'referrer' && !value) {
          value = document.referrer;
        }
        
        input.value = value;
      }
    }
  });
}

/**
 * Escucha clics en botones de conversión para analíticas y lógica de pago
 */
function setupClickListeners() {
  document.addEventListener('click', (e) => {
    // 1. Clics en WhatsApp
    const wspLink = e.target.closest('a[href*="wa.me"]');
    if (wspLink) {
      trackEvent('click_whatsapp', {
        link_url: wspLink.href,
        page_origin: window.location.pathname
      });
    }

    // 2. Clics en "Ver Planes"
    const planesBtn = e.target.closest('[data-action="ver-planes"]');
    if (planesBtn) {
      trackEvent('click_ver_planes', {
        page_origin: window.location.pathname
      });
    }

    // 3. Botón de "Reservar Valoración" (al formulario)
    const reservarBtn = e.target.closest('[data-action="reservar-valoracion"]');
    if (reservarBtn) {
      trackEvent('click_reservar_valoracion', {
        page_origin: window.location.pathname
      });
    }
  });
}

/**
 * Función central para registrar eventos de conversión y analíticas
 * @param {string} eventName Nombre del evento
 * @param {Object} params Parámetros adicionales
 */
function trackEvent(eventName, params = {}) {
  // Comprobar consentimiento de cookies
  const consent = localStorage.getItem('cookies-consent');
  const isAccepted = (consent === 'accepted');

  console.log(`[Tracking Event] ${eventName}:`, params, `(Consentimiento: ${consent})`);

  if (!isAccepted) {
    // Si no hay consentimiento, no disparamos etiquetas de terceros
    return;
  }

  // Comprobar si gtag está disponible
  if (typeof gtag !== 'function') {
    return;
  }

  // Generar datos comunes para enriquecer el evento
  const commonParams = {
    lead_id: localStorage.getItem('tmp_lead_id') || '',
    gclid: localStorage.getItem('tmp_gclid') || '',
    utm_source: localStorage.getItem('tmp_utm_source') || '',
    utm_medium: localStorage.getItem('tmp_utm_medium') || '',
    utm_campaign: localStorage.getItem('tmp_utm_campaign') || '',
    send_to: TRACKING_CONFIG.GA4_MEASUREMENT_ID
  };

  const eventData = { ...commonParams, ...params };

  // DISPARAR EVENTOS SEGÚN EL CASO
  switch (eventName) {
    case 'page_view':
      gtag('event', 'page_view', eventData);
      break;

    case 'click_whatsapp':
      gtag('event', 'click_whatsapp', eventData);
      // Disparar conversión Google Ads para WhatsApp si hay label
      if (TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID && TRACKING_CONFIG.GOOGLE_ADS_LABEL_WHATSAPP) {
        gtag('event', 'conversion', {
          'send_to': `${TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID}/${TRACKING_CONFIG.GOOGLE_ADS_LABEL_WHATSAPP}`
        });
      }
      break;

    case 'click_ver_planes':
      gtag('event', 'click_ver_planes', eventData);
      break;

    case 'click_reservar_valoracion':
      gtag('event', 'click_reservar_valoracion', eventData);
      break;

    case 'click_solicitar_plan':
      gtag('event', 'click_solicitar_plan', eventData);
      break;

    case 'lead_reserva_valoracion':
      // DEDUPLICACIÓN CRÍTICA: Validar si este lead_id ya fue enviado
      const leadId = eventData.lead_id;
      const alreadySent = localStorage.getItem(`tmp_sent_lead_${leadId}`);
      
      if (!alreadySent) {
        gtag('event', 'lead_reserva_valoracion', eventData);
        
        // Registrar en localStorage para evitar duplicados en recargas
        localStorage.setItem(`tmp_sent_lead_${leadId}`, 'true');
        
        // Conversión en Google Ads
        if (TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID && TRACKING_CONFIG.GOOGLE_ADS_LABEL_LEAD) {
          gtag('event', 'conversion', {
            'send_to': `${TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID}/${TRACKING_CONFIG.GOOGLE_ADS_LABEL_LEAD}`,
            'value': 1.0,
            'currency': 'EUR'
          });
        }
        console.log(`[Tracking] Conversión lead_reserva_valoracion enviada y guardada para ${leadId}`);
      } else {
        console.warn(`[Tracking] Evento lead_reserva_valoracion omitido por duplicación para el lead_id: ${leadId}`);
      }
      break;

    case 'checkout_start':
      gtag('event', 'begin_checkout', eventData);
      if (TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID && TRACKING_CONFIG.GOOGLE_ADS_LABEL_CHECKOUT_START) {
        gtag('event', 'conversion', {
          'send_to': `${TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID}/${TRACKING_CONFIG.GOOGLE_ADS_LABEL_CHECKOUT_START}`,
          'value': eventData.value || 0,
          'currency': 'EUR'
        });
      }
      break;

    case 'payment_pending':
      gtag('event', 'payment_pending', eventData);
      break;

    case 'purchase_success':
      // NO disparar por simple parámetro de URL. Se requiere confirmación real.
      // Aquí se dispararía en el futuro cuando el servidor o token valide el pago
      gtag('event', 'purchase', {
        ...eventData,
        transaction_id: eventData.order_id,
        value: eventData.value,
        currency: 'EUR',
        items: [{
          item_name: eventData.plan,
          price: eventData.value,
          quantity: 1
        }]
      });
      
      if (TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID && TRACKING_CONFIG.GOOGLE_ADS_LABEL_PURCHASE) {
        gtag('event', 'conversion', {
          'send_to': `${TRACKING_CONFIG.GOOGLE_ADS_CONVERSION_ID}/${TRACKING_CONFIG.GOOGLE_ADS_LABEL_PURCHASE}`,
          'value': eventData.value,
          'currency': 'EUR'
        });
      }
      break;

    case 'purchase_failed':
      gtag('event', 'purchase_failed', eventData);
      break;

    default:
      gtag('event', eventName, eventData);
  }
}

/**
 * Gestor dinámico de clics en planes de precio. Redirige según el PAYMENT_PROVIDER.
 * @param {string} planId Identificador del plan ('pack-4', 'pack-8', 'intensivo', 'universidad', 'urgente')
 */
function handlePlanSelection(planId) {
  localStorage.setItem('tmp_selected_plan', planId);
  trackEvent('click_solicitar_plan', { plan: planId });

  const provider = TRACKING_CONFIG.PAYMENT_PROVIDER;

  if (provider === 'manual') {
    // Redirección por defecto al formulario de valoración para asesorar primero
    window.location.href = `reservar.html?plan=${planId}`;
  } 
  else if (provider === 'hotmart') {
    // En el futuro, enviar directamente al checkout de Hotmart si ya existe URL configurada
    const checkoutUrl = TRACKING_CONFIG.CHECKOUT_URLS[planId];
    if (checkoutUrl) {
      trackEvent('checkout_start', { plan: planId, provider: 'hotmart' });
      window.location.href = checkoutUrl;
    } else {
      // Si no hay checkout listo, va a pendiente
      window.location.href = `checkout-pendiente.html?plan=${planId}&provider=hotmart`;
    }
  } 
  else if (provider === 'wise_manual') {
    // Redirigir a la página informativa de pago manual en EUR
    window.location.href = `checkout-pendiente.html?plan=${planId}&provider=wise_manual`;
  } 
  else if (provider === 'payoneer') {
    // Redirigir a checkout pendiente
    window.location.href = `checkout-pendiente.html?plan=${planId}&provider=payoneer`;
  }
}
