param(
  [string]$OutputDir = ".\\backups"
)

Write-Host "⏳ Iniciando backup de la base de datos..."

# Obtener DATABASE_URL desde variables de entorno o desde .env
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
  $envFile = Join-Path $PSScriptRoot "..\..\.env"
  if (Test-Path $envFile) {
    $lines = Get-Content $envFile | ForEach-Object { $_.Trim() }
    $dbLine = $lines | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
    if ($dbLine) { $databaseUrl = $dbLine -replace '^DATABASE_URL=', '' }
  }
}

if (-not $databaseUrl) {
  Write-Error "❌ No se encontró DATABASE_URL en las variables de entorno ni en .env. Exporta DATABASE_URL o crea un .env con DATABASE_URL."
  exit 1
}

# Verificar que pg_dump esté disponible
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Error "❌ pg_dump no está instalado o no está en PATH. Instala las herramientas cliente de PostgreSQL (pg_dump) antes de continuar."
  exit 2
}

# Crear carpeta de salida
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$fileName = "backup-$timestamp.dump"
$fullPath = Join-Path -Path $OutputDir -ChildPath $fileName

Write-Host "📦 Guardando backup en: $fullPath"

try {
  & pg_dump $databaseUrl -F c -b -v -f $fullPath
  if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ pg_dump finalizó con código de salida $LASTEXITCODE"
    exit $LASTEXITCODE
  }
  Write-Host "✅ Backup completado: $fullPath"
} catch {
  Write-Error "❌ Error ejecutando pg_dump: $_"
  exit 3
}
