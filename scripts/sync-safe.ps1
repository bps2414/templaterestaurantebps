# ============================================
# Safe Sync: Main -> Template B (Shield Mode)
# Protege a identidade visual do Template B enquanto importa logica da Main
# Uso: .\scripts\sync-safe.ps1 [-DryRun]
# ============================================
param (
    [switch]$DryRun = $false
)

# --- Configuracao: Zona Proibida (Blacklist) ---
$ProtectedFiles = @(
    "public/images/",      
    "public/favicon.ico",  
    "styles.css",          
    "index.html",
    "public/index.html",          
    "tailwind.config.js",  
    "config_full.json"     
)

# --- Cores para Output ---
function Write-Color($text, $color) {
    Write-Host $text -ForegroundColor $color
}

function Write-Step($text) {
    Write-Color "`n> $text" "Cyan"
}

function Write-Success($text) {
    Write-Color "   [OK] $text" "Green"
}

function Write-Warning($text) {
    Write-Color "   [WARN] $text" "Yellow"
}

function Write-Error($text) {
    Write-Color "   [ERROR] $text" "Red"
}

# --- 1. Validacao de Ambiente ---
Write-Step "Verificando ambiente..."

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "template-b") {
    Write-Error "Voce NAO esta na branch 'template-b'. Branch atual: $currentBranch"
    Write-Warning "Este script deve ser rodado NA branch de destino (template-b)."
    exit 1
}
Write-Success "Branch correta: template-b"

$status = git status --porcelain
if ($status) {
    Write-Error "O diretorio de trabalho NAO esta limpo. Commite ou descarte mudancas antes de sincronizar."
    exit 1
}
Write-Success "Diretorio de trabalho limpo"

if ($DryRun) {
    Write-Warning "MODO SIMULACAO (DRY RUN) ATIVADO. Nenhuma alteracao real sera feita."
}

# --- 2. Preparacao do Merge ---
Write-Step "Buscando atualizacoes da Main..."

if (-not $DryRun) {
    git fetch origin main | Out-Null
    
    Write-Color "   Iniciando merge da main (no-commit)..." "Gray"
    try {
        git merge main --no-commit --no-ff | Out-Null
    }
    catch {
        Write-Warning "Conflitos de merge detectados. O script tentara resolver os protegidos automaticamente."
    }
}
else {
    Write-Color "   [DryRun] git fetch origin main" "Gray"
    Write-Color "   [DryRun] git merge main --no-commit --no-ff" "Gray"
}

# --- 3. Restauracao de Identidade (The Shield) ---
Write-Step "Ativando Escudo de Protecao (Restaurando arquivos do Template B)..."

foreach ($filePattern in $ProtectedFiles) {
    if (-not $DryRun) {
        $target = $filePattern
        try {
            # Force checkout of protected files from HEAD (ignoring merge conflicts in them)
            git checkout HEAD -- $target 2>&1 | Out-Null
            Write-Success "Protegido: $target"
        }
        catch {
            Write-Warning "Falha ao proteger $target (talvez nao exista ou nao tenha mudado)"
        }
    }
    else {
        Write-Color "   [DryRun] git checkout HEAD -- $filePattern" "Gray"
    }
}

# --- 4. Verificacao de Conflitos Restantes ---
if (-not $DryRun) {
    $conflicts = git diff --name-only --diff-filter=U
    if ($conflicts) {
        Write-Error "CONFLITOS NAO RESOLVIDOS EM ARQUIVOS NAO-PROTEGIDOS:"
        $conflicts | ForEach-Object { Write-Color "   - $_" "Red" }
        Write-Warning "O script nao pode continuar. Resolva os conflitos manualmente e rode o build/test."
        exit 1
    }
}

# --- 5. Validacao e Dependencias ---
Write-Step "Validando projeto..."

if (-not $DryRun) {
    Push-Location "server"
    
    # Check if package.json changed
    $packageChanged = git diff "HEAD@{1}" --name-only | Select-String "package.json"
    if ($packageChanged) {
        Write-Warning "Dependencias alteradas. Rodando npm install..."
        cmd /c "npm install" 2>&1 | Out-Null
    }

    Write-Color "   Executando npm run build..." "Gray"
    try {
        cmd /c "npm run build" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build do servidor: OK"
        }
        else {
            Write-Error "O merge QUEBROU o build do servidor."
            Write-Warning "Recomendado: 'git merge --abort' para desfazer tudo."
            $abort = Read-Host "Deseja abortar agora? (s/n)"
            if ($abort -eq 's') {
                git merge --abort
                Pop-Location
                exit 1
            }
        }
    }
    catch {
        Write-Error "Erro ao tentar executar build."
    }
    
    # Optional: Run tests if available
    # cmd /c "npm test" ...

    Pop-Location
}
else {
    Write-Color "   [DryRun] cd server; npm install (if needed); npm run build" "Gray"
}

# --- 6. Finalizacao ---
Write-Step "Resumo da Sincronizacao"

if (-not $DryRun) {
    git status --short
    
    Write-Color "`nPronto para commitar." "Green"
    $confirm = Read-Host "Deseja finalizar o commit e push? (s/n)"
    
    if ($confirm -eq 's') {
        git commit -m "sync: merge main -> template-b (shielded mode)"
        git push origin template-b
        Write-Success "Sincronizacao concluida com sucesso!"
    }
    else {
        Write-Warning "Commit cancelado. As alteracoes (staged) ainda estao no seu diretorio."
        Write-Color "Use 'git merge --abort' se quiser desfazer tudo." "Gray"
    }
}
else {
    Write-Success "[DryRun] Simulacao concluida sem erros."
}
