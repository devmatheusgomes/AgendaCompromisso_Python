# Monta e instala o launcher na TV LG (Windows / PowerShell).
#
# Uso (na pasta lg-launcher):
#   powershell -ExecutionPolicy Bypass -File instalar-lg.ps1 -Tv tv
#
# Antes: Node.js + webOS TV CLI (npm install -g @webos-tools/cli), Developer Mode ligado na TV
# e a TV cadastrada com ares-setup-device (o nome cadastrado vai em -Tv). Veja o README.md.

param(
    [Parameter(Mandatory = $true)][string]$Tv
)

$ErrorActionPreference = "Stop"
$base   = $PSScriptRoot
$shared = Join-Path $base "..\tv-launcher"
$dist   = Join-Path $base "dist"
$out    = Join-Path $base "out"

foreach ($cmd in @("ares-package", "ares-install", "ares-launch")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "Nao encontrei $cmd. Instale com: npm install -g @webos-tools/cli" -ForegroundColor Red
        exit 1
    }
}

Write-Host "1/3 Montando o app..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $dist, $out
New-Item -ItemType Directory $dist | Out-Null
# Código comum (o mesmo da versão Samsung)
Copy-Item (Join-Path $shared "index.html") $dist
foreach ($dir in @("css", "js", "icons")) { Copy-Item -Recurse (Join-Path $shared $dir) $dist }
$wall = Join-Path $shared "wallpaper.jpg"
if (Test-Path $wall) { Copy-Item $wall $dist }
# Arquivos da LG por cima
Copy-Item (Join-Path $base "appinfo.json"), (Join-Path $base "icon.png"), (Join-Path $base "largeIcon.png") $dist
Copy-Item -Force (Join-Path $base "css\platform.css") (Join-Path $dist "css")
Copy-Item -Force (Join-Path $base "js\platform.js") (Join-Path $dist "js")

Write-Host "2/3 Empacotando..." -ForegroundColor Cyan
ares-package $dist -o $out
$ipk = Get-ChildItem (Join-Path $out "*.ipk") | Select-Object -First 1
if (-not $ipk) { throw "O pacote .ipk nao foi gerado. Veja a mensagem acima." }

Write-Host "3/3 Instalando e abrindo na TV '$Tv'..." -ForegroundColor Cyan
ares-install -d $Tv $ipk.FullName
ares-launch -d $Tv com.inicio.launcher
Write-Host "Pronto! O app 'Inicio' esta na TV." -ForegroundColor Green
