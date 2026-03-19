<#
.SYNOPSIS
    Runs local preflight checks (Build, Migrate, Seed, Test) before pushing code.
    Supports interactive single-theme mode (-Serve) and batch lite-theme mode (-TestAll).
.DESCRIPTION
    This script automates the validation process:
    1. Sets up a test database environment (restaurant_test_preflight).
    2. Runs 'npm run build' to verify compilation (once).
    3. For each theme: resets DB  seeds  runs tests  injects static assets.
    4. -Serve:   interactive prompt  launches dev server + opens browser.
    5. -TestAll: runs all 4 lite themes in sequence  shows pass/fail summary table.
.NOTES
    Requires a running PostgreSQL instance on localhost:5432 (e.g., Docker).
    Expected creds: postgres/postgres.

    Lite/Starter themes:  restaurant-lite | burger-lite | pizza-lite | acai
    Full themes:          restaurante | hamburgueria | pizzaria | confeitaria

    Usage examples:
      .\scripts\preflight.ps1              # single run with current env vars
      .\scripts\preflight.ps1 -Serve       # interactive + dev server
      .\scripts\preflight.ps1 -TestAll     # batch-test all 4 lite themes
#>

param (
    [switch]$Serve,
    [switch]$TestAll
)

# -- Helpers -----------------------------------------------------------------

function Prompt-Choice {
    param (
        [string]$Message,
        [string[]]$Options,
        [int]$DefaultIndex = 0
    )
    Write-Host "`n$Message" -ForegroundColor Yellow
    for ($i = 0; $i -lt $Options.Count; $i++) {
        $display = if ($i -eq $DefaultIndex) { "$($Options[$i]) (Default)" } else { $Options[$i] }
        Write-Host "[$i] $display"
    }
    $selection = Read-Host "Select an option (0-$($Options.Count - 1))"
    if ([string]::IsNullOrWhiteSpace($selection)) { return $Options[$DefaultIndex] }
    if ($selection -match "^\d+$" -and [int]$selection -ge 0 -and [int]$selection -lt $Options.Count) { return $Options[[int]$selection] }
    Write-Warning "Invalid selection, using default."
    return $Options[$DefaultIndex]
}

function Resolve-DefaultIndex {
    param ([string]$Value, [string[]]$Options)
    $idx = [Array]::IndexOf($Options, $Value)
    if ($idx -ge 0) { return $idx }
    return 0
}

# Run theme-inject + migrate-reset + seed + test for a given theme entry.
# Must be called from within $ServerDir (Push-Location already applied).
# Returns $true on full pass, $false on any failure.
function Run-ThemeTest {
    param (
        [string]$SeedType,
        [string]$Theme,
        [string]$Plan
    )
    $Env:SEED_TYPE = $SeedType
    $Env:THEME = $Theme
    $Env:PLAN = $Plan

    # Inject static theme assets
    Write-Host "   [THEME] Injecting: $Theme" -ForegroundColor DarkYellow
    Push-Location $script:RootDir
    $tp = Start-Process -FilePath "node.exe" -ArgumentList "scripts/select-theme.js" -NoNewWindow -Wait -PassThru
    Pop-Location
    if ($tp.ExitCode -ne 0) { Write-Warning "   [WARN] Theme injection failed - $Theme"; return $false }

    # Migrate reset (schema only, no seed)
    Write-Host "   [DB] Resetting schema..." -ForegroundColor DarkYellow
    $mp = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "migrate", "reset", "--force", "--skip-seed" -NoNewWindow -Wait -PassThru
    if ($mp.ExitCode -ne 0) { Write-Warning "   [WARN] Migration reset failed - $SeedType"; return $false }

    # Seed
    Write-Host "   [SEED] Seeding: $SeedType ($Plan)..." -ForegroundColor DarkYellow
    $sp = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "db", "seed" -NoNewWindow -Wait -PassThru
    if ($sp.ExitCode -ne 0) { Write-Warning "   [WARN] Seed failed - $SeedType"; return $false }

    # Test suite
    Write-Host "   [TEST] Running test suite..." -ForegroundColor DarkYellow
    $tp2 = Start-Process -FilePath "npm.cmd" -ArgumentList "test" -NoNewWindow -Wait -PassThru
    if ($tp2.ExitCode -ne 0) { Write-Warning "   [WARN] Tests failed - $SeedType"; return $false }

    return $true
}

# -- 1. Startup ---------------------------------------------------------------

Write-Host "[START] Starting Preflight Validation..." -ForegroundColor Cyan

$TestDBName = "restaurant_test_preflight"
$script:RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$ServerDir = Join-Path $PSScriptRoot "../server"
$EnvFile = Join-Path $ServerDir ".env"

# -- 2. Load .env (skip DIRECT_URL so test DB overrides it) ------------------
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

# -- 3. Test Environment Defaults ---------------------------------------------
$Env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/$TestDBName?schema=public"
$Env:DIRECT_URL = $Env:DATABASE_URL
if (-not $Env:CLOUDINARY_CLOUD_NAME) { $Env:CLOUDINARY_CLOUD_NAME = "local_test" }
if (-not $Env:CLOUDINARY_API_KEY) { $Env:CLOUDINARY_API_KEY = "123456789" }
if (-not $Env:CLOUDINARY_API_SECRET) { $Env:CLOUDINARY_API_SECRET = "local_secret" }
if (-not $Env:JWT_SECRET) { $Env:JWT_SECRET = "local_preflight_secret_123" }

Write-Host "[INFO] Test DB: $TestDBName" -ForegroundColor DarkGray

# -- 4. Validate server directory ---------------------------------------------
if (-not (Test-Path $ServerDir)) {
    Write-Error "[ERROR] Server directory not found at $ServerDir"
    exit 1
}

# -- 5. Interactive Overrides (-Serve) ----------------------------------------
$AllTypes = @("restaurant-lite", "burger-lite", "pizza-lite", "acai",
    "restaurante", "hamburgueria", "pizzaria", "confeitaria")
$AllThemes = $AllTypes
$AllPlans = @("starter", "professional", "essential")

if ($Serve) {
    Write-Host "`n[INTERACTIVE MODE]" -ForegroundColor Magenta

    $Env:SEED_TYPE = Prompt-Choice -Message "Choose Seed Type:"       -Options $AllTypes  -DefaultIndex (Resolve-DefaultIndex $Env:SEED_TYPE $AllTypes)
    $Env:PLAN = Prompt-Choice -Message "Choose Plan:"            -Options $AllPlans  -DefaultIndex (Resolve-DefaultIndex $Env:PLAN      $AllPlans)
    $Env:THEME = Prompt-Choice -Message "Choose Theme (Frontend):" -Options $AllThemes -DefaultIndex (Resolve-DefaultIndex $Env:THEME     $AllThemes)

    Write-Host "Using  SEED_TYPE=$($Env:SEED_TYPE)  PLAN=$($Env:PLAN)  THEME=$($Env:THEME)" -ForegroundColor Gray
}

# -- 6. Build (runs once regardless of mode) ----------------------------------
Push-Location $ServerDir

Write-Host "`n[BUILD] Building project..." -ForegroundColor Yellow
$buildProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "build" -NoNewWindow -Wait -PassThru
if ($buildProcess.ExitCode -ne 0) {
    Write-Error "[ERROR] Build Failed!"
    Pop-Location; exit 1
}
Write-Host "[OK] Build Success" -ForegroundColor Green

# -- 7a. BATCH MODE (-TestAll) ------------------------------------------------
if ($TestAll) {
    Write-Host "`n[BATCH] Testing ALL 4 lite themes..." -ForegroundColor Magenta

    $LiteThemes = @(
        [PSCustomObject]@{ SeedType = "restaurant-lite"; Theme = "restaurant-lite"; Plan = "starter" },
        [PSCustomObject]@{ SeedType = "burger-lite"; Theme = "burger-lite"; Plan = "starter" },
        [PSCustomObject]@{ SeedType = "pizza-lite"; Theme = "pizza-lite"; Plan = "starter" },
        [PSCustomObject]@{ SeedType = "acai"; Theme = "acai"; Plan = "starter" }
    )

    $Results = @()
    foreach ($entry in $LiteThemes) {
        Write-Host "`n" -ForegroundColor DarkCyan
        Write-Host "  Theme: $($entry.Theme.ToUpper())" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor DarkCyan

        $pass = Run-ThemeTest -SeedType $entry.SeedType -Theme $entry.Theme -Plan $entry.Plan
        $status = if ($pass) { "PASS" } else { "FAIL" }
        $Results += [PSCustomObject]@{
            Theme  = $entry.Theme
            Status = $status
            Pass   = $pass
        }
    }

    # Summary table
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  PREFLIGHT SUMMARY - Lite Themes" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    foreach ($r in $Results) {
        if ($r.Pass) {
            Write-Host "  [PASS]  $($r.Theme)" -ForegroundColor Green
        }
        else {
            Write-Host "  [FAIL]  $($r.Theme)" -ForegroundColor Red
        }
    }
    Write-Host "========================================" -ForegroundColor Cyan

    Pop-Location

    $failCount = ($Results | Where-Object { -not $_.Pass }).Count
    if ($failCount -gt 0) {
        Write-Error "[FAIL] $failCount lite theme(s) failed - fix before starting Phase 6."
        exit 1
    }

    Write-Host "`n[SUCCESS] All 4 lite themes passed! Ready for Phase 6. " -ForegroundColor Cyan
    exit 0
}

# -- 7b. SINGLE-THEME MODE ----------------------------------------------------

# Apply theme
Write-Host "`n[THEME] Applying theme: $($Env:THEME)..." -ForegroundColor Yellow
Push-Location $script:RootDir
$themeProcess = Start-Process -FilePath "node.exe" -ArgumentList "scripts/select-theme.js" -NoNewWindow -Wait -PassThru
Pop-Location
if ($themeProcess.ExitCode -ne 0) {
    Write-Error "[ERROR] Theme application failed!"
    Pop-Location; exit 1
}
Write-Host "[OK] Theme Applied" -ForegroundColor Green

# Migrate reset
Write-Host "`n[DB] Setting up test database..." -ForegroundColor Yellow
Write-Host "   - Resetting migration..." -ForegroundColor Gray
$migrateProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "migrate", "reset", "--force", "--skip-seed" -NoNewWindow -Wait -PassThru
if ($migrateProcess.ExitCode -ne 0) {
    Write-Error "[ERROR] Migration Reset Failed"
    Pop-Location; exit 1
}

# Seed
Write-Host "   - Seeding ($($Env:SEED_TYPE))..." -ForegroundColor Gray
$seedProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "prisma", "db", "seed" -NoNewWindow -Wait -PassThru
if ($seedProcess.ExitCode -eq 0) {
    Write-Host "[OK] Database Ready" -ForegroundColor Green
}
else {
    Write-Error "[ERROR] Database Seed Failed"
    Pop-Location; exit 1
}

# Tests
Write-Host "`n[TEST] Running tests..." -ForegroundColor Yellow
$testProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "test" -NoNewWindow -Wait -PassThru
if ($testProcess.ExitCode -eq 0) {
    Write-Host "[OK] All Tests Passed" -ForegroundColor Green
}
else {
    Write-Error "[ERROR] Tests Failed!"
    Pop-Location; exit 1
}

# -- 8. Serve (Optional) -------------------------------------------------------
if ($Serve) {
    Write-Host "`n[SERVE] Launching dev server for manual testing..." -ForegroundColor Magenta
    Start-Process "http://localhost:3000"
    Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

    $AdminEmail = if ($Env:SEED_ADMIN_EMAIL) { $Env:SEED_ADMIN_EMAIL } else { "admin@$($Env:SEED_TYPE).com" }
    $AdminPass = if ($Env:SEED_ADMIN_PASSWORD) { $Env:SEED_ADMIN_PASSWORD } else { "admin123" }
    Write-Host "`n[LOGIN] Credenciais para teste local:" -ForegroundColor Green
    Write-Host "   User: $AdminEmail" -ForegroundColor White
    Write-Host "   Pass: $AdminPass" -ForegroundColor White
    Write-Host "-----------------------------------------`n" -ForegroundColor DarkGray

    npm.cmd run dev
}

# -- Done ----------------------------------------------------------------------
Pop-Location
Write-Host "`n[SUCCESS] Preflight Passed! You are safe to push." -ForegroundColor Cyan
exit 0
