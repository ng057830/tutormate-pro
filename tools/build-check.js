const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SEO_DIR = path.join(ROOT_DIR, 'seo');
const LATAM_DIR = path.join(ROOT_DIR, 'latam');

let exitCode = 0;

function logError(file, message) {
  console.error(`\x1b[31m[ERROR] [${file}]: ${message}\x1b[0m`);
  exitCode = 1;
}

function logWarning(file, message) {
  console.warn(`\x1b[33m[WARN]  [${file}]: ${message}\x1b[0m`);
}

function checkHtmlFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('tutormatepro.es')) {
    logError(relativePath, 'References the obsolete tutormatepro.es domain');
  }

  if (content.includes('priceValued')) {
    logError(relativePath, 'Contains invalid Schema.org property "priceValued"');
  }

  // 1. Check title tag
  const titleMatch = content.match(/<title>([^]*?)<\/title>/i);
  if (!titleMatch) {
    logError(relativePath, "Missing <title> tag");
  } else {
    const title = titleMatch[1].trim();
    if (title.length === 0) {
      logError(relativePath, "<title> tag is empty");
    } else if (title.length > 70) {
      logWarning(relativePath, `<title> is too long (${title.length} chars: "${title}")`);
    } else if (title.length < 25) {
      logWarning(relativePath, `<title> is too short (${title.length} chars: "${title}")`);
    }
  }

  // 2. Check meta description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^]*?)["']\s*\/?>/i) ||
                    content.match(/<meta\s+content=["']([^]*?)["']\s+name=["']description["']\s*\/?>/i);
  if (!descMatch) {
    logError(relativePath, "Missing <meta name=\"description\"> tag");
  } else {
    const desc = descMatch[1].trim();
    if (desc.length === 0) {
      logError(relativePath, "Meta description is empty");
    } else if (desc.length > 165) {
      logWarning(relativePath, `Meta description is too long (${desc.length} chars)`);
    } else if (desc.length < 80) {
      logWarning(relativePath, `Meta description is too short (${desc.length} chars)`);
    }
  }

  // 3. Check canonical tag
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^]*?)["']\s*\/?>/i);
  if (!canonicalMatch) {
    logError(relativePath, "Missing <link rel=\"canonical\"> tag");
  } else {
    const canonical = canonicalMatch[1].trim();
    const expectedBasename = path.basename(filePath);
    const relativeHtmlPath = path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
    const canonicalPath = expectedBasename === 'index.html'
      ? relativeHtmlPath.replace(/index\.html$/, '')
      : relativeHtmlPath;
    const expectedCanonical = `https://www.tutormatepro.com/${canonicalPath}`;
    
    // Allow ending with / for root domain index.html
    const isRootIndex = relativeHtmlPath === 'index.html';
    if (isRootIndex) {
      if (canonical !== 'https://www.tutormatepro.com/' && canonical !== 'https://www.tutormatepro.com') {
        logWarning(relativePath, `Canonical URL mismatch. Expected: "https://www.tutormatepro.com/", got: "${canonical}"`);
      }
    } else if (canonical !== expectedCanonical) {
      logWarning(relativePath, `Canonical URL mismatch. Expected: "${expectedCanonical}", got: "${canonical}"`);
    }
  }

  // 4. Check single H1 tag
  const h1Matches = content.match(/<h1[^>]*>([^]*?)<\/h1>/gi);
  if (!h1Matches) {
    logError(relativePath, "Missing <h1> tag");
  } else if (h1Matches.length > 1) {
    logError(relativePath, `Multiple <h1> tags found (${h1Matches.length})`);
  }

  // 5. Check H2 and H3 tags structure
  const h2Matches = content.match(/<h2[^>]*>/gi);
  if (!h2Matches || h2Matches.length === 0) {
    logWarning(relativePath, "No <h2> tags found");
  }

  // 6. Check for CTA
  const hasCta = content.includes('contacto.html') || 
                 content.includes('calendar-link') || 
                 content.includes('mailto:') ||
                 content.includes('#reservar');
  if (!hasCta) {
    logWarning(relativePath, "No CTA links found (contacto.html, calendar-link, or mailto)");
  }

  // 7. Check for internal links and assets (Broken Links Check)
  const hrefMatches = [...content.matchAll(/href=["']([^"']*)["']/gi)];
  const srcMatches = [...content.matchAll(/src=["']([^"']*)["']/gi)];

  const checkLocalPath = (rawPath, attrName) => {
    // Ignore external URLs, mailto, tel, empty, and hashes
    if (!rawPath || 
        rawPath.startsWith('http://') || 
        rawPath.startsWith('https://') || 
        rawPath.startsWith('mailto:') || 
        rawPath.startsWith('tel:') || 
        rawPath.startsWith('#') ||
        rawPath.startsWith('javascript:')) {
      return;
    }

    // Parse the path relative to the file directory
    const fileDir = path.dirname(filePath);
    let targetPath = '';
    
    if (rawPath.startsWith('/')) {
      // Root-relative path
      targetPath = path.join(ROOT_DIR, rawPath);
    } else {
      // Relative path
      targetPath = path.resolve(fileDir, rawPath);
    }

    // Strip query strings or hash parameters from file checks
    targetPath = targetPath.split('?')[0].split('#')[0];

    if (!fs.existsSync(targetPath)) {
      logError(relativePath, `Broken reference in ${attrName}="${rawPath}" (Resolved to: ${targetPath})`);
    }
  };

  hrefMatches.forEach(m => checkLocalPath(m[1], 'href'));
  srcMatches.forEach(m => checkLocalPath(m[1], 'src'));
}

function runAudit() {
  console.log("Starting HTML & SEO Quality Audit...\n");

  // Audit root HTML files
  const rootFiles = fs.readdirSync(ROOT_DIR)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(ROOT_DIR, file));

  rootFiles.forEach(file => {
    checkHtmlFile(file);
  });

  // Audit SEO HTML files
  if (fs.existsSync(SEO_DIR)) {
    const seoFiles = fs.readdirSync(SEO_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(SEO_DIR, file));

    seoFiles.forEach(file => {
      checkHtmlFile(file);
    });
  }

  if (fs.existsSync(LATAM_DIR)) {
    const latamFiles = fs.readdirSync(LATAM_DIR)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(LATAM_DIR, file));

    latamFiles.forEach(file => checkHtmlFile(file));
  }

  // Audit sitemap.xml
  const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = [...sitemapContent.matchAll(/<loc>https:\/\/www\.tutormatepro\.com\/([^<]*)<\/loc>/gi)];
    
    locMatches.forEach(match => {
      const relativeUrl = match[1];
      const localFilePath = relativeUrl === '' 
        ? path.join(ROOT_DIR, 'index.html') 
        : path.join(ROOT_DIR, relativeUrl);
      
      if (!fs.existsSync(localFilePath)) {
        logError('sitemap.xml', `Sitemap references non-existent file: "${relativeUrl}"`);
      }
    });

    const indexableRootFiles = fs.readdirSync(ROOT_DIR)
      .filter(file => file.endsWith('.html'))
      .filter(file => {
        const html = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
        return !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
      });

    indexableRootFiles.forEach(file => {
      const expectedUrl = file === 'index.html'
        ? 'https://www.tutormatepro.com/'
        : `https://www.tutormatepro.com/${file}`;
      if (!sitemapContent.includes(`<loc>${expectedUrl}</loc>`)) {
        logWarning('sitemap.xml', `Indexable page missing from sitemap: "${file}"`);
      }
    });
  } else {
    logWarning('Root', 'sitemap.xml is missing');
  }

  console.log("\n-------------------------------------------");
  if (exitCode === 0) {
    console.log("\x1b[32m[SUCCESS] All checks passed successfully!\x1b[0m");
  } else {
    console.error("\x1b[31m[FAILURE] Audit failed. Please fix the errors listed above.\x1b[0m");
  }
  process.exit(exitCode);
}

runAudit();
