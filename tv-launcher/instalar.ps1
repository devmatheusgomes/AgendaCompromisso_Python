# Empacota e instala o launcher na TV Samsung (Windows / PowerShell).
#
# Uso (na pasta tv-launcher):
#   powershell -ExecutionPolicy Bypass -File instalar.ps1 -TvIp 192.168.0.50 -Perfil MeuPerfil
#
# Antes: Tizen Studio instalado, Developer Mode ligado na TV com o IP deste PC,
# e um perfil de certificado Samsung (TV) criado no Certificate Manager.

param(
    [Parameter(Mandatory = $true)][string]$TvIp,
    [Parameter(Mandatory = $true)][string]$Perfil,
    [string]$TizenStudio = "C:\tizen-studio"
)

$ErrorActionPreference = "Stop"
$sdb   = Join-Path $TizenStudio "tools\sdb.exe"
$tizen = Join-Path $TizenStudio "tools\ide\bin\tizen.bat"

foreach ($f in @($sdb, $tizen)) {
    if (-not (Test-Path $f)) {
        Write-Host "Nao encontrei $f. Informe a pasta do Tizen Studio com -TizenStudio." -ForegroundColor Red
        exit 1
    }
}

Write-Host "1/4 Conectando na TV $TvIp..." -ForegroundColor Cyan
& $sdb connect $TvIp
$linha = (& $sdb devices) | Where-Object { $_ -match [regex]::Escape($TvIp) } | Select-Object -First 1
if (-not $linha -or $linha -match "offline") {
    Write-Host "A TV nao respondeu. Confira o IP, se o Developer Mode esta ligado com o IP deste PC e se a TV foi reiniciada." -ForegroundColor Red
    exit 1
}
$serial = ($linha -split "\s+")[0]
$nome   = ($linha -split "\s+")[-1]
Write-Host "    Conectado: $serial ($nome)"

Push-Location $PSScriptRoot
try {
    Write-Host "2/4 Limpando pacote antigo..." -ForegroundColor Cyan
    Remove-Item -ErrorAction SilentlyContinue *.wgt

    Write-Host "3/4 Empacotando com o perfil '$Perfil'..." -ForegroundColor Cyan
    & $tizen package -t wgt -s $Perfil
    $wgt = Get-ChildItem *.wgt | Select-Object -First 1
    if (-not $wgt) { throw "O pacote .wgt nao foi gerado. Veja a mensagem acima (perfil de certificado correto?)." }

    Write-Host "4/4 Instalando $($wgt.Name)..." -ForegroundColor Cyan
    & $tizen install -n $wgt.Name -t $nome
    Write-Host "Pronto! Abra 'Inicio' em Apps na TV." -ForegroundColor Green
}
finally {
    Pop-Location
}
