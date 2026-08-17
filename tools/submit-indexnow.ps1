param(
  [string]$HostName = 'www.tutormatepro.com',
  [string]$SitemapUrl = 'https://www.tutormatepro.com/sitemap.xml'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$key = 'c8d0d7408a6d4f8e99a30f490a9b9e12'
$keyLocation = "https://$HostName/$key.txt"
[xml]$sitemap = (Invoke-WebRequest -Uri $SitemapUrl -UseBasicParsing).Content
$namespace = New-Object Xml.XmlNamespaceManager($sitemap.NameTable)
$namespace.AddNamespace('s', 'http://www.sitemaps.org/schemas/sitemap/0.9')
$urls = @($sitemap.SelectNodes('//s:loc', $namespace) | ForEach-Object { $_.InnerText })

if (-not $urls.Count) {
  throw "El sitemap no contiene URL para enviar."
}

$payload = @{
  host = $HostName
  key = $key
  keyLocation = $keyLocation
  urlList = $urls
} | ConvertTo-Json -Depth 3

$response = Invoke-WebRequest `
  -Uri 'https://api.indexnow.org/indexnow' `
  -Method Post `
  -ContentType 'application/json; charset=utf-8' `
  -Body $payload `
  -UseBasicParsing

Write-Output "IndexNow aceptó $($urls.Count) URL. Estado HTTP: $($response.StatusCode)."
