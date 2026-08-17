# Auditoría SEO y conversión — TutorMate Pro

Fecha: 16 de agosto de 2026

## Resumen ejecutivo

El dominio y sus recursos esenciales responden correctamente por HTTPS. `robots.txt` permite el rastreo y declara un sitemap válido. No se detectó un bloqueo técnico general de indexación.

La consulta pública de páginas indexadas mostró principalmente la portada española. El resultado disponible conservaba contenido anterior, señal de que Google todavía no había vuelto a procesar todos los cambios recientes. Las nuevas páginas LATAM no aparecieron como resultados independientes en las consultas realizadas.

El mayor problema interno era la desigualdad técnica entre mercados: España tenía GA4 y seguimiento de conversiones, mientras que LATAM no cargaba la etiqueta de analítica en la mayoría de sus páginas. También faltaban relaciones regionales página por página, datos estructurados homogéneos, contenido explícito para padres y controles automáticos más estrictos.

## Estado encontrado

| Área | Estado inicial | Riesgo |
|---|---|---|
| HTTPS, dominio canónico y disponibilidad | Correcto | Bajo |
| `robots.txt` y sitemap accesibles | Correcto | Bajo |
| Indexación observada | Principalmente la portada española | Alto |
| Fragmento mostrado por el buscador | Desactualizado | Alto |
| Canonical en páginas comerciales | Presente | Bajo |
| Hreflang España–LATAM | Completo solo en portadas | Alto |
| Medición GA4 en España | Presente | Bajo |
| Medición GA4 en LATAM | Incompleta o ausente | Crítico |
| Contenido orientado a padres en LATAM | Insuficiente | Alto |
| Datos estructurados LATAM | Solo portada | Medio |
| Página 404 propia | Ausente | Medio |
| Peso de imágenes principales | Aproximadamente 1,44 MB | Medio |
| Control automático de regresiones SEO | Básico | Medio |

## Correcciones implementadas

### Rastreo e indexación

- Sitemap internacional con namespace `xhtml` y pares recíprocos `es-ES` / `es-419`.
- Inclusión exclusiva de URL canónicas que interesa posicionar.
- Exclusión del sitemap y `noindex,follow` para páginas legales sin intención de captación.
- Fechas `lastmod` actualizadas únicamente en contenido realmente modificado.
- Página `404.html` propia con `noindex,follow` y regreso automático a la región adecuada.

### SEO internacional

- Relación España–LATAM para portada, planes, método, reserva, contacto, materiales, juegos, presentación y niveles equivalentes.
- Canonical independiente por región.
- Idioma `es-ES` para España y `es-419` para LATAM.
- Las antiguas URL regionales permanecen fuera del sitemap y redirigen a sus equivalentes canónicos.

### Datos estructurados

- Grafo JSON-LD verificable para `EducationalOrganization`, `Service` y `WebSite` en las portadas.
- `WebPage` y `BreadcrumbList` en las páginas internas LATAM.
- Identificadores estables para conectar organización, sitio y servicio.
- Información regional y audiencia expresadas sin inventar reseñas, puntuaciones ni precios.

### Analítica y conversiones

- Carga de GA4 después del consentimiento también en LATAM.
- Carga del módulo común de conversiones y parámetros UTM en todas las páginas LATAM.
- Conservación de `landing_page`, `referrer`, UTM y `gclid` para atribución.
- Consentimiento publicitario mantenido en estado denegado cuando el visitante acepta únicamente analítica.
- Protección contra dobles cargas del módulo de seguimiento.

### Contenido comercial

- Nueva sección específicamente dirigida a madres y padres en la portada LATAM.
- Explicación clara de objetivo, atención individual y seguimiento.
- CTA para conversar sobre el caso del hijo, no únicamente para “comprar clases”.
- Descripción SEO LATAM orientada a familias, secundaria, bachillerato, universidad y valoración gratuita.
- Navegación completa y consistente en todas las páginas LATAM.

### Rendimiento y calidad

- Pizarra principal optimizada de 675 KB a aproximadamente 67 KB.
- Retrato optimizado de 763 KB a aproximadamente 20 KB.
- Dimensiones explícitas, carga diferida y decodificación asíncrona en imágenes secundarias.
- Auditoría automática ampliada para comprobar títulos, descripciones, canonical, H1, enlaces rotos, JSON-LD, páginas ausentes del sitemap, títulos duplicados, descripciones duplicadas, correo obsoleto y seguridad de enlaces externos.
- Consolidación de dos páginas estacionales casi duplicadas: la URL secundaria redirige a la versión más completa para concentrar relevancia y evitar competencia interna.

## Lo que no puede garantizar el código

SEO no produce posiciones ni clientes inmediatos por sí solo. Google decide cuándo rastrear, indexar y ordenar una página. La autoridad del dominio, enlaces externos, competencia, estacionalidad, reputación real y comportamiento de los visitantes siguen influyendo.

Tampoco deben añadirse testimonios, estrellas, aprobados o resultados académicos sin evidencia real. Las señales falsas pueden perjudicar la confianza y vulnerar las políticas de datos estructurados.

## Acciones externas necesarias

La sesión revisada de Search Console estaba abierta con `ngmstats@gmail.com`, una cuenta sin acceso a la propiedad. Para completar los envíos debe iniciarse sesión con `tutormatepro@gmail.com` o concederle acceso a la cuenta actual.

1. Verificar la propiedad de dominio en Google Search Console.
2. Enviar `https://www.tutormatepro.com/sitemap.xml`.
3. Inspeccionar y solicitar indexación de las URL prioritarias de España y LATAM.
4. Revisar semanalmente consultas, impresiones, CTR, países, dispositivos y páginas de entrada.
5. Conseguir menciones y enlaces legítimos desde recursos educativos, asociaciones de familias, centros, directorios de tutores y colaboraciones académicas.
6. Publicar contenido útil basado en preguntas reales de padres; evitar artículos genéricos generados solo para acumular palabras clave.

## URL prioritarias para solicitar indexación

- `https://www.tutormatepro.com/`
- `https://www.tutormatepro.com/planes.html`
- `https://www.tutormatepro.com/reservar.html`
- `https://www.tutormatepro.com/seo/profesor-particular-matematicas-online.html`
- `https://www.tutormatepro.com/seo/clases-matematicas-eso.html`
- `https://www.tutormatepro.com/seo/clases-matematicas-bachillerato.html`
- `https://www.tutormatepro.com/seo/preparacion-ebau-matematicas.html`
- `https://www.tutormatepro.com/latam/`
- `https://www.tutormatepro.com/latam/planes.html`
- `https://www.tutormatepro.com/latam/reservar.html`
- `https://www.tutormatepro.com/latam/secundaria.html`
- `https://www.tutormatepro.com/latam/preparatoria.html`
- `https://www.tutormatepro.com/latam/universidad.html`

## Métricas que deben guiar las siguientes decisiones

- Impresiones orgánicas por país y página.
- CTR de consultas con intención de contratar.
- Clics en “Reservar valoración”.
- Aperturas del calendario.
- Formularios enviados y tasa de conversión por página de entrada.
- Consultas de padres frente a consultas de alumnos.
- Tiempo desde el primer contacto hasta la reserva.
- Porcentaje de valoraciones que terminan en un plan confirmado.

La siguiente fase no consiste en añadir texto indiscriminadamente. Debe basarse en los datos reales de Search Console y GA4: reforzar páginas con impresiones y CTR bajo, ampliar consultas que ya aparecen entre posiciones 8 y 20, y mejorar las páginas de entrada que reciben visitas pero no generan reservas.
