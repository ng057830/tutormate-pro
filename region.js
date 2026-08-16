(function () {
  // Remove the obsolete manual preference so an earlier selection cannot mix regions.
  try { localStorage.removeItem('tutormate-region'); } catch (_) { /* no-op */ }

  const pageRegion = document.documentElement.dataset.region;
  if (!pageRegion || document.documentElement.dataset.regionRedirect !== 'true') return;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const isAmericanMarket = timezone.startsWith('America/') || timezone === 'Pacific/Honolulu';
  const detectedRegion = isAmericanMarket ? 'mx' : 'es';
  const onAmericanSite = window.location.pathname.startsWith('/mexico/');

  if (detectedRegion === 'mx' && !onAmericanSite) {
    window.location.replace('/mexico/');
  } else if (detectedRegion === 'es' && onAmericanSite) {
    window.location.replace('/');
  }
})();
