# ============================================
# Script de Sincronização: JS Core Files
# Main → Template-B (apenas após testar na main)
# Uso: .\sync-core-js.ps1
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Sync Core JS: Main → Template-B         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Arquivos que devem ser sincronizados
$coreFiles = @(
    "public/js/feedback.js",
    "public/js/whatsappFormatter.js"
)

# Verificar branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "template-b") {
    Write-Host "⚠️  Você está na branch: $currentBranch" -ForegroundColor Yellow
    $continue = Read-Host "Continuar mesmo assim? (s/n)"
    if ($continue -ne 's') {
        exit 0
    }
}

Write-Host "📍 Branch: $currentBranch`n" -ForegroundColor Yellow

$syncedFiles = @()
$errorFiles = @()

foreach ($file in $coreFiles) {
    Write-Host "🔄 Sincronizando $file..." -ForegroundColor Cyan
    
    try {
        # Buscar versão da main
        git show main:$file | Out-File -FilePath $file -Encoding UTF8
        
        # Verificar se houve mudanças
        $diff = git diff --stat $file
        
        if ($diff) {
            $syncedFiles += $file
            Write-Host "   ✅ Atualizado!" -ForegroundColor Green
        } else {
            Write-Host "   ✓ Já sincronizado" -ForegroundColor Gray
        }
        
    } catch {
        $errorFiles += $file
        Write-Host "   ❌ Erro: $_" -ForegroundColor Red
    }
}

# Resumo
Write-Host "`n📊 RESUMO:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($syncedFiles.Count -gt 0) {
    Write-Host "✅ Arquivos atualizados: $($syncedFiles.Count)" -ForegroundColor Green
    $syncedFiles | ForEach-Object { Write-Host "   • $_" -ForegroundColor White }
    
    Write-Host "`n📦 Mostrar diff completo? (s/n)" -ForegroundColor Yellow
    $showDiff = Read-Host
    if ($showDiff -eq 's') {
        git diff $syncedFiles
    }
    
    Write-Host "`n💾 Commitar mudanças? (s/n)" -ForegroundColor Yellow
    $commit = Read-Host
    
    if ($commit -eq 's') {
        git add $syncedFiles
        $commitMsg = "sync: core JS files from main [auto-sync]`n`n" + ($syncedFiles | ForEach-Object { "- $_" }) -join "`n"
        git commit -m $commitMsg
        Write-Host "✅ Commit criado!" -ForegroundColor Green
        
        Write-Host "`n🚀 Push para origin/$currentBranch? (s/n)" -ForegroundColor Yellow
        $push = Read-Host
        if ($push -eq 's') {
            git push origin $currentBranch
            Write-Host "✅ Push completo!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ Todos os arquivos já estão sincronizados!" -ForegroundColor Green
}

if ($errorFiles.Count -gt 0) {
    Write-Host "`n❌ Erros em: $($errorFiles.Count) arquivo(s)" -ForegroundColor Red
    $errorFiles | ForEach-Object { Write-Host "   • $_" -ForegroundColor White }
}

Write-Host "`n🎉 Processo completo!`n" -ForegroundColor Green
