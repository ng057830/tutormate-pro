(function () {
  const REGION_KEY = 'tutormate-region';
  const params = new URLSearchParams(window.location.search);
  const requestedRegion = params.get('region');

  if (requestedRegion === 'mx' || requestedRegion === 'es') {
    localStorage.setItem(REGION_KEY, requestedRegion);
  }

  document.addEventListener('click', (event) => {
    const selector = event.target.closest('[data-region]');
    if (!selector) return;
    localStorage.setItem(REGION_KEY, selector.dataset.region);
  });

  const pageRegion = document.documentElement.dataset.region;
  if (!pageRegion || document.documentElement.dataset.regionRedirect !== 'true') return;

  const savedRegion = localStorage.getItem(REGION_KEY);
  let detectedRegion = savedRegion;

  if (!detectedRegion) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const mexicoTimezones = new Set([
      'America/Mexico_City', 'America/Cancun', 'America/Chihuahua',
      'America/Ciudad_Juarez', 'America/Hermosillo', 'America/Matamoros',
      'America/Mazatlan', 'America/Merida', 'America/Monterrey',
      'America/Ojinaga', 'America/Tijuana', 'America/Bahia_Banderas'
    ]);
    if (mexicoTimezones.has(timezone)) detectedRegion = 'mx';
    if (timezone === 'Europe/Madrid' || timezone === 'Atlantic/Canary') detectedRegion = 'es';
  }

  const onMexicoSite = window.location.pathname.startsWith('/mexico/');
  if (detectedRegion === 'mx' && !onMexicoSite) {
    window.location.replace('/mexico/');
  } else if (detectedRegion === 'es' && onMexicoSite) {
    window.location.replace('/');
  }
})();
