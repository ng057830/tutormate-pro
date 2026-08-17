(function () {
  // Remove the obsolete manual preference so an earlier selection cannot mix regions.
  try { localStorage.removeItem('tutormate-region'); } catch (_) { /* no-op */ }

  const pageRegion = document.documentElement.dataset.region;
  if (!pageRegion || document.documentElement.dataset.regionRedirect !== 'true') return;

  if (pageRegion === 'mx') {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const items = [
      ['index.html', './', 'Inicio'],
      ['planes.html', 'planes.html', 'Planes'],
      ['metodo.html', 'metodo.html', 'Método'],
      ['materiales.html', 'materiales.html', 'Materiales'],
      ['juegos.html', 'juegos.html', 'Juegos'],
      ['sobre-mi.html', 'sobre-mi.html', 'Sobre mí'],
      ['reservar.html', 'reservar.html', 'Reservar']
    ];
    const links = items.map(([file, href, label]) =>
      `<a href="${href}" class="nav-link${currentFile === file ? ' active' : ''}">${label}</a>`
    ).join('');
    const desktopNav = document.querySelector('.nav-menu');
    const mobileNav = document.querySelector('.nav-menu-mobile');
    if (desktopNav) desktopNav.innerHTML = links;
    if (mobileNav) mobileNav.innerHTML = `${links}<a href="reservar.html" class="btn btn-primary">Reservar valoración</a>`;

    if (currentFile !== 'index.html' && !document.querySelector('script[data-seo-graph]')) {
      const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split(/[?#]/)[0];
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const heading = document.querySelector('h1')?.textContent.trim() || document.title.split('|')[0].trim();
      const graph = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: document.title,
            description,
            inLanguage: 'es-419',
            isPartOf: { '@id': 'https://www.tutormatepro.com/#website' },
            about: { '@id': 'https://www.tutormatepro.com/latam/#service' }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'TutorMate Pro LATAM', item: 'https://www.tutormatepro.com/latam/' },
              { '@type': 'ListItem', position: 2, name: heading, item: canonical }
            ]
          }
        ]
      };
      const structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.dataset.seoGraph = 'latam';
      structuredData.textContent = JSON.stringify(graph);
      document.head.appendChild(structuredData);
    }
  }

  // Vista privada de desarrollo: solo funciona desde el servidor local del propietario.
  const previewRequest = new URLSearchParams(window.location.search).get('preview');
  const requestedRegion = previewRequest === 'latam' ? 'mx' : previewRequest;
  const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && requestedRegion === pageRegion;
  if (isLocalPreview) return;

  // Los buscadores deben poder rastrear ambas variantes declaradas en el sitemap.
  const isSearchCrawler = /googlebot|google-inspectiontool|googleother|storebot-google|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandexbot/i.test(navigator.userAgent);
  if (isSearchCrawler) return;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const isAmericanMarket = timezone.startsWith('America/') || timezone === 'Pacific/Honolulu';
  const detectedRegion = isAmericanMarket ? 'mx' : 'es';
  const onAmericanSite = window.location.pathname.startsWith('/latam/');

  const sharedPages = new Set([
    'planes.html', 'metodo.html', 'materiales.html', 'juegos.html',
    'sobre-mi.html', 'reservar.html', 'contacto.html'
  ]);
  const currentPage = window.location.pathname.split('/').pop();
  const americanTarget = sharedPages.has(currentPage) ? `/latam/${currentPage}` : '/latam/';
  const spanishTarget = sharedPages.has(currentPage) ? `/${currentPage}` : '/';

  if (detectedRegion === 'mx' && !onAmericanSite) {
    window.location.replace(americanTarget);
  } else if (detectedRegion === 'es' && onAmericanSite) {
    window.location.replace(spanishTarget);
  }
})();
