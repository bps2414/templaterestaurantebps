# ============================================
# Script de Sincronização: Main → Template-B
# Uso: .\sync-admin.ps1
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Sync Admin: Main → Template-B           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path "public/admin.html")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Salvar branch atual
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Branch atual: $currentBranch`n" -ForegroundColor Yellow

# Sincronizar admin.html
Write-Host "🔄 Sincronizando admin.html..." -ForegroundColor Cyan
try {
    # Buscar versão da main
    git show main:public/admin.html | Out-File -FilePath "public/admin.html" -Encoding UTF8
    
    # Verificar se houve mudanças
    $changes = git diff --stat public/admin.html
    
    if ($changes) {
        Write-Host "✅ Arquivo atualizado com sucesso!" -ForegroundColor Green
        Write-Host "`n📊 Mudanças:" -ForegroundColor Yellow
        Write-Host $changes
        
        # Perguntar se quer commitar
        $commit = Read-Host "`nCommitar mudanças? (s/n)"
        
        if ($commit -eq 's') {
            git add public/admin.html
            git commit -m "sync: admin.html from main [auto-sync]"
            Write-Host "✅ Commit criado!" -ForegroundColor Green
            
            $push = Read-Host "`nFazer push para origin/$currentBranch? (s/n)"
            if ($push -eq 's') {
                git push origin $currentBranch
                Write-Host "✅ Push completo!" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "✅ admin.html já está sincronizado!" -ForegroundColor Green
    }
    
}
catch {
    Write-Host "❌ Erro ao sincronizar: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Sincronização completa!`n" -ForegroundColor Green
