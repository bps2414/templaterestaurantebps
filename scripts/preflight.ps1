<#
.SYNOPSIS
    Runs local preflight checks (Build, Migrate, Seed, Test) before pushing code.
    Can also launch the server for manual testing.
.DESCRIPTION
    This script automates the validation process:
    1. Sets up a test database environment (restaurant_test_preflight).
    2. Runs 'npm run build' to verify compilation.
    3. Resets and seeds the test database using Prisma.
    4. Runs 'npm test' to verify functionality.
    5. If -Serve is used, launches the dev server and opens the browser.
.NOTES
    Requires a running PostgreSQL instance on localhost:5432 (e.g., Docker).
    Expected creds: postgres/postgres.
#>

param (
    [switch]$Serve
)

function Prompt-Choice {
    param (
        [string]$Message,
        [string[]]$Options,
        [int]$DefaultIndex = 0
    )
    
    Write-Host "`n$Message" -ForegroundColor Yellow
    for ($i = 0; $i -lt $Options.Count; $i++) {
        $option = $Options[$i]
        $display = if ($i -eq $DefaultIndex) { "$option (Default)" } else { $option }
        Write-Host "[$i] $display"
    }
    
    $selection = Read-Host "Select an option (0-$($Options.Count - 1))"
    if ([string]::IsNullOrWhiteSpace($selection)) {
        return $Options[$DefaultIndex]
    }
    if ($selection -match "^\d+$" -and [int]$selection -ge 0 -and [int]$selection -lt $Options.Count) {
        return $Options[[int]$selection]
    }
    Write-Warning "Invalid selection, using default."
    return $Options[$DefaultIndex]
}

Write-Host "[START] Starting Preflight Validation..." -ForegroundColor Cyan

# 1. Base Configuration
$TestDBName = "restaurant_test_preflight"
$ServerDir = Join-Path $PSScriptRoot "../server"
$EnvFile = Join-Path $ServerDir ".env"

# Load base .env variables if they exist (except DB ones)
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | Where-Object { $_ -match "^[^#].+=.+" } | ForEach-Object {
        $parts = $_.Split('=', 2)
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            if ($key -ne "DIRECT_URL" -and -not [string]::IsNullOrWhiteSpace($key)) {
                Set-Item -Path "Env:\$key" -Value $val
            }
        }
    }
}

# 2. Interactive Overrides
if ($Serve) {
    Write-Host "`n[INTERACTIVE MODE]" -ForegroundColor Magenta
    
    # Use existing environment variables as defaults for the prompt if possible
    $DefaultTypeIndex = if ($Env:SEED_TYPE -eq 'hamburgueria') { 1 } elseif ($Env:SEED_TYPE -eq 'pizzaria') { 2 } else { 0 }
    $DefaultPlanIndex = if ($Env:PLAN -eq 'essential') { 1 } else { 0 }
    $DefaultThemeIndex = if ($Env:THEME -eq 'hamburgueria') { 1 } else { 0 }

    $Env:SEED_TYPE = Prompt-Choice -Message "Choose Seed Type:" -Options @("restaurante", "hamburgueria", "pizzaria") -DefaultIndex $DefaultTypeIndex
    $Env:PLAN = Prompt-Choice -Message "Choose Plan:" -Options @("professional", "essential") -DefaultIndex $DefaultPlanIndex
    $Env:THEME = Prompt-Choice -Message "Choose Theme (Frontend):" -Options @("restaurante", "hamburgueria") -DefaultIndex $DefaultThemeIndex
    
    Write-Host "Overriding with SEED_TYPE=$($Env:SEED_TYPE), PLAN=$($Env:PLAN), THEME=$($Env:THEME) (Interactive)" -ForegroundColor Gray
}

# 3. Test Environment Security
if (-not $Env:DATABASE_URL) {
    $Env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/$TestDBName?schema=public"
}
$Env:DIRECT_URL = $Env:DATABASE_URL

# Silence Cloudinary warnings
$Env:CLOUDINARY_CLOUD_NAME = "local_test"
$Env:CLOUDINARY_API_KEY = "123456789"
$Env:CLOUDINARY_API_SECRET = "local_secret"

# Ensure a JWT_SECRET exists
if (-not $Env:JWT_SECRET) {
    $Env:JWT_SECRET = "local_preflight_secret_123"
}

Write-Host "[INFO] Using Test Database: $TestDBName" -ForegroundColor DarkGray

# Definition of the server directory path
$ServerDir = Join-Path $PSScriptRoot "../server"

# Check if server directory exists
if (-not (Test-Path $ServerDir)) {
    Write-Error "[ERROR] Server directory not found at $ServerDir"
    exit 1
}

# Change context to server directory
Push-Location $ServerDir

# 2. Build Check
Write-Host "`n[BUILD] Building Project..." -ForegroundColor Yellow
$buildProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "build" -NoNewWindow -Wait -PassThru
if ($buildProcess.ExitCode -eq 0) {
    Write-Host "[OK] Build Success" -ForegroundColor Green
    
    # Apply Theme (Static Build Injection)
    Write-Host "`n[THEME] Applying theme: $($Env:THEME)..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "..")
    $themeProcess = Start-Process -FilePath "node.exe" -ArgumentList "scripts/select-theme.js" -NoNewWindow -Wait -PassThru
    Pop-Location
    
    if ($themeProcess.ExitCode -ne 0) {
        Write-Error "[ERROR] Theme application failed!"
        Pop-Location
        exit 1
    }
    Write-Host "[OK] Theme Applied" -ForegroundColor Green
}
else {
    Write-Error "[ERROR] Build Failed!"
    Pop-Location
    exit 1
}

# 3. Database Setup (Migrate & Seed on Test DB)
Write-Host "`n[DB] Setting up Test Database..." -ForegroundColor Yellow

# Reset Database (Force drop and recreate)
Write-Host "   - Resetting Migration..." -ForegroundColor Gray
$migrateProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "migrate", "reset", "--force", "--skip-seed" -NoNewWindow -Wait -PassThru

if ($migrateProcess.ExitCode -ne 0) {
    Write-Error "[ERROR] Migration Reset Failed"
    Pop-Location
    exit 1
}

# Seed Database
Write-Host "   - Seeding Database ($($Env:SEED_TYPE))..." -ForegroundColor Gray
$seedProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "db", "seed" -NoNewWindow -Wait -PassThru

if ($seedProcess.ExitCode -eq 0) {
    Write-Host "[OK] Database Ready" -ForegroundColor Green
}
else {
    Write-Error "[ERROR] Database Seed Failed"
    Pop-Location
    exit 1
}

# 4. Run Tests
Write-Host "`n[TEST] Running Tests..." -ForegroundColor Yellow
$testProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "test" -NoNewWindow -Wait -PassThru

if ($testProcess.ExitCode -eq 0) {
    Write-Host "[OK] All Tests Passed" -ForegroundColor Green
}
else {
    Write-Error "[ERROR] Tests Failed!"
    Pop-Location
    exit 1
}

# 5. Serve (Optional)
if ($Serve) {
    Write-Host "`n[SERVE] Launching Dev Server for Manual Testing..." -ForegroundColor Magenta
    Write-Host "Opening http://localhost:3000..." -ForegroundColor Gray
    
    # Open Browser
    Start-Process "http://localhost:3000"
    
    # Start Server (This will block until Ctrl+C)
    # Using 'cmd /c' to allow proper termination if needed, or just run directly
    Write-Host "Press Ctrl+C to stop the server and cleanup." -ForegroundColor Yellow
    
    # Show credentials for convenience
    $AdminEmail = if ($Env:SEED_ADMIN_EMAIL) { $Env:SEED_ADMIN_EMAIL } else { "admin@$($Env:SEED_TYPE).com" }
    $AdminPass = if ($Env:SEED_ADMIN_PASSWORD) { $Env:SEED_ADMIN_PASSWORD } else { "admin123" }
    Write-Host "`n[LOGIN] Credenciais para teste local:" -ForegroundColor Green
    Write-Host "   User: $AdminEmail" -ForegroundColor White
    Write-Host "   Pass: $AdminPass" -ForegroundColor White
    Write-Host "-----------------------------------------`n" -ForegroundColor DarkGray

    npm.cmd run dev
}

# Cleanup and Exit
Pop-Location
Write-Host "`n[SUCCESS] Preflight Passed! You are safe to push." -ForegroundColor Cyan
exit 0
