# Guía Técnica de Analítica e Integraciones de Conversión

Este documento sirve como manual técnico para conectar y configurar Google Analytics 4 (GA4), Google Ads y la pasarela de pagos Hotmart en TutorMate Pro en el futuro.

---

## 1. Configuración de Píxeles de Seguimiento

Toda la lógica de analítica está concentrada en el archivo [tracking.js](file:///g:/My%20Drive/TutorMate%20Pro/tracking.js). Abre este archivo y edita la constante inicial `TRACKING_CONFIG` con los valores reales provistos por tus plataformas de marketing:

```javascript
const TRACKING_CONFIG = {
  // 1. Reemplaza con tu ID de Google Tag Manager o etiqueta global de sitio (gtag)
  GOOGLE_TAG_ID: 'G-CEQ1MQZWDH',
  GA4_MEASUREMENT_ID: 'G-CEQ1MQZWDH',
  
  // 2. Reemplaza con tu ID de Conversión de Google Ads (ej: 'AW-123456789')
  GOOGLE_ADS_CONVERSION_ID: 'AW-XXXXXXXXX',
  
  // 3. Pega los labels generados en la sección de Conversiones de Google Ads
  GOOGLE_ADS_LABEL_LEAD: 'EtiquetaLead_XXXXXXXXX',            // Valoración inicial gratuita
  GOOGLE_ADS_LABEL_WHATSAPP: 'EtiquetaWhatsapp_XXXXXXXXX',    // Click a WhatsApp
  GOOGLE_ADS_LABEL_CHECKOUT_START: 'EtiquetaCheckout_XXXXXX', // Selección de plan
  GOOGLE_ADS_LABEL_PURCHASE: 'EtiquetaPurchase_XXXXXXXXX',    // Compra confirmada
  ...
}
```

---

## 2. Definición y Mapeo de Eventos

El embudo de conversión mide tres niveles de interacción para diferenciar microconversiones y conversiones reales:

| Evento de Analítica | Tipo de Conversión | Activador | Destino de Redirección |
| :--- | :--- | :--- | :--- |
| `click_whatsapp` | Microconversión | Clic en botones de WhatsApp | Enlace externo wa.me |
| `click_ver_planes` | Interacción | Clic en el botón secundario del Hero | `/planes.html` |
| `click_solicitar_plan` | Microconversión | Clic en "Solicitar plan" en las tarjetas | `/reservar.html?plan=x` o `/checkout-pendiente.html` |
| `lead_reserva_valoracion` | **Conversión Principal (Lead)** | Carga única de la página de confirmación | `/gracias-reserva.html` |
| `payment_pending` | Interacción / Puente | Carga de la página informativa de checkout | `/checkout-pendiente.html` |
| `purchase_success` | **Conversión Final (Compra)** | Confirmación criptográfica segura de pago | `/gracias-pago.html` |

---

## 3. Mecanismo de Deduplicación para `lead_reserva_valoracion`

Para evitar que recargar la página `/gracias-reserva.html` envíe múltiples conversiones a Google Ads/GA4, `tracking.js` implementa un filtro mediante el `lead_id` generado:

1. Cuando el usuario envía el formulario en `/reservar.html`, el script genera un identificador único (ej: `lead_1718134510000_3j2a1c`).
2. Se le redirige a `/gracias-reserva.html?lead_id=lead_1718134510000_3j2a1c`.
3. Al cargar, `tracking.js` comprueba si existe la clave `tmp_sent_lead_lead_1718134510000_3j2a1c` en el `localStorage` del navegador.
4. Si **no** existe, dispara los eventos `gtag('event', 'lead_reserva_valoracion', ...)` y marca la clave como `true`.
5. Si el usuario recarga la página, el script detecta que la clave ya está registrada y **cancela** el envío repetido del evento, asegurando la limpieza de tus métricas publicitarias.

---

## 4. Estructura de Pago Segura en `/gracias-pago.html`

Por exigencia de seguridad, la página `/gracias-pago.html` **no registra compras reales** si un usuario simplemente añade `?status=paid` en la barra de direcciones del navegador.

### Lógica de Compra Segura
Para que el evento de conversión `purchase_success` sea disparado en producción:
- El servidor de checkout (ej: Hotmart) debe validar la compra y notificar a un endpoint de backend.
- O bien, el checkout debe redirigir a `/gracias-pago.html` adjuntando un token firmado criptográficamente (`&sig=HASH_SHA256`) generado por el servidor, que combine el `order_id` y tu secreto compartido de forma que sea infalsificable por usuarios comunes.
- El panel de `/gracias-pago.html` se mantiene en estado **Pendiente** y muestra una advertencia técnica si se intenta inyectar el parámetro `status=paid` sin firma digital.

---

## 5. Integración Futura con Hotmart (Webhooks)

Cuando decidas integrar Hotmart para cobrar tus paquetes de clases en euros de forma automatizada:

1. **Crear webhook en Hotmart:**
   En el panel de Hotmart, ve a *Herramientas* -> *Webhook (API y Notificaciones)* y crea una suscripción para el evento **"Compra Aprobada"**.

2. **Apuntar al servidor / endpoint:**
   Apunta las llamadas del webhook a un endpoint seguro (ej: `/api/webhooks/hotmart`).

3. **Validación del Secreto de Hotmart:**
   Cuando llegue el JSON de notificación por POST, valida el token `X-Hotmart-Hotkey` en las cabeceras HTTP de tu servidor:
   ```python
   # Ejemplo en pseudo-código de backend
   if request.headers.get('X-Hotmart-Hotkey') != HOTMART_WEBHOOK_SECRET:
       return "No autorizado", 401
   ```

4. **Registro de la orden y Redirección:**
   Una vez aprobada la firma en el servidor, registra el `order_id` y redirige al cliente a:
   `https://www.tutormatepro.com/gracias-pago.html?status=paid&order_id=NRO_ORDEN&plan=PLAN_CONTRATADO&amount_eur=VALOR&sig=FIRMA_VERIFICADA`
