# test_fix.ps1 - Testa o fix de encoding e mostra resultado

$enc_utf8   = [System.Text.Encoding]::UTF8
$enc_latin1 = [System.Text.Encoding]::GetEncoding("iso-8859-1")
$path = "f:\VSCode\SaaS Restaurante\Templates\themes\restaurant-lite\admin.html"

$bytes   = [System.IO.File]::ReadAllBytes($path)
$content = $enc_utf8.GetString($bytes)
$fixed   = $enc_utf8.GetString($enc_latin1.GetBytes($content))

Write-Host "=== ANTES (linhas com sequencias corrompidas) ==="
($content -split "`n") | Where-Object { $_.Contains("Ã") -or $_.Contains("â€") } | Select-Object -First 15 | ForEach-Object { Write-Host $_.Trim() }

Write-Host ""
Write-Host "=== DEPOIS (mesmas linhas apos fix) ==="
($fixed -split "`n") | Where-Object { $_.Contains("rdpio") -or $_.Contains("nfig") -or $_.Contains("es") -or $_.Contains("cri") -or $_.Contains("pre") } | Select-Object -First 15 | ForEach-Object { Write-Host $_.Trim() }
