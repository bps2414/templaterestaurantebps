# fix_encoding.ps1 - Corrige double-encoding UTF-8 nos admin.html dos temas lite
# Causa: arquivos foram lidos como Windows-1252 e re-salvos como UTF-8
# Fix: re-encodar como ISO-8859-1 e decodar como UTF-8 (reverter o mojibake)

param(
    [switch]$DryRun
)

$root = "f:\VSCode\SaaS Restaurante\Templates"

$files = @(
    "themes\restaurant-lite\admin.html",
    "themes\burger-lite\admin.html",
    "themes\pizza-lite\admin.html",
    "themes\acai\admin.html",
    "tmp\admin-starter-template.html"
)

$enc_utf8 = [System.Text.Encoding]::UTF8
$enc_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1")
$enc_utf8_nobom = New-Object System.Text.UTF8Encoding($false)

foreach ($rel in $files) {
    $path = Join-Path $root $rel

    if (-not (Test-Path $path)) {
        Write-Warning "NAO ENCONTRADO: $rel"
        continue
    }

    # Ler bytes brutos e decodificar como UTF-8
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $content = $enc_utf8.GetString($bytes)

    # Contar ocorrencias de sequencia corrompida tipica (ex: "CardApio" em mojibake)
    $matches_before = ([regex]::Matches($content, "A[^\x00-\x7F]")).Count

    # Reverter mojibake: interpretar UTF-8 como Latin-1, redecodar como UTF-8
    $fixed = $enc_utf8.GetString($enc_latin1.GetBytes($content))

    $matches_after = ([regex]::Matches($fixed, "A[^\x00-\x7F]")).Count

    Write-Host ""
    Write-Host "[$rel]"
    Write-Host "  Seq. suspeitas ANTES : $matches_before"
    Write-Host "  Seq. suspeitas DEPOIS: $matches_after"

    # Mostrar amostras das linhas corrigidas
    $lines = $fixed -split "`n"
    $samples = $lines | Where-Object { $_ -match "rdp|nfig|es|escri|re" } | Select-Object -First 5
    foreach ($s in $samples) {
        Write-Host "  >> $($s.Trim().Substring(0, [Math]::Min(80, $s.Trim().Length)))"
    }

    if (-not $DryRun) {
        [System.IO.File]::WriteAllText($path, $fixed, $enc_utf8_nobom)
        Write-Host "  STATUS: SALVO (UTF-8 sem BOM)" -ForegroundColor Green
    }
    else {
        Write-Host "  STATUS: DRY-RUN (nao salvo)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Concluido." -ForegroundColor Cyan
