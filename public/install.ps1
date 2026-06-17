# CortexPrism Installation (PowerShell)
# Cross-platform Windows installer — served from https://cortexprism.io/install.ps1

param(
    [string]$Repo = "CortexPrism/cortex",
    [string]$Branch = "main",
    [string]$InstallDir = ""
)

$ESC = [char]27

$BOLD = "${ESC}[1m"
$DIM = "${ESC}[2m"
$GREEN = "${ESC}[0;32m"
$CYAN = "${ESC}[0;36m"
$YELLOW = "${ESC}[0;33m"
$RED = "${ESC}[0;31m"
$NC = "${ESC}[0m"

function Write-Info { Write-Host "$GREEN$args$NC" }
function Write-Warn { Write-Host "${YELLOW}WARN:${NC} $args" }
function Write-Header { Write-Host "`n${BOLD}${CYAN}==> $args${NC}" }
function Write-ErrorExit { Write-Host "${RED}ERROR:${NC} $args"; exit 1 }

$CORTEX_DIR = if ($InstallDir) { $InstallDir } else { Join-Path $env:USERPROFILE ".cortex" }
$DENO_DIR = Join-Path $env:USERPROFILE ".deno"
$BIN_DIR = Join-Path $DENO_DIR "bin"
$CORTEX_WRAPPER = Join-Path $BIN_DIR "cortex.bat"

Write-Host @"

  ╔══════════════════════════════════════╗
  ║       CortexPrism Installer         ║
  ║   Open-Source Agentic Harness       ║
  ╚══════════════════════════════════════╝

"@

try {
    $osInfo = Get-CimInstance Win32_OperatingSystem
    Write-Info "  OS:      Windows $($osInfo.Version)"
} catch {
    Write-Info "  OS:      Windows"
}
Write-Info "  Arch:    x86_64"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Header "Installing Git for Windows"
    $gitInstallers = @(
        { $null = winget install --id Git.Git -e --source winget 2>&1 }
        { $null = choco install git -y 2>&1 }
        { $null = scoop install git 2>&1 }
    )
    $installed = $false
    foreach ($installer in $gitInstallers) {
        & $installer
        if ($LASTEXITCODE -eq 0 -and (Get-Command git -ErrorAction SilentlyContinue)) {
            $installed = $true
            break
        }
    }
    if (-not $installed) {
        Write-ErrorExit "Git for Windows is required. Install from https://git-scm.com/download/win and re-run this installer."
    }
    Write-Info "  ✓ Git installed"
} else {
    Write-Info "  ✓ Git found"
}

Write-Header "Checking Deno"
if (-not (Get-Command deno -ErrorAction SilentlyContinue)) {
    Write-Header "Installing Deno"
    Write-Host "$DIM  Downloading Deno installer...$NC"
    try {
        iwr https://deno.land/install.ps1 -useb | iex
    } catch {
        Write-ErrorExit "Deno installation failed. Install manually: https://docs.deno.land/runtime/getting_started/installation"
    }

    if (-not (Get-Command deno -ErrorAction SilentlyContinue)) {
        $env:Path = "$BIN_DIR;$env:Path"
        if (-not (Get-Command deno -ErrorAction SilentlyContinue)) {
            Write-ErrorExit "Deno installation failed. Install manually: https://docs.deno.land/runtime/getting_started/installation"
        }
    }
}
Write-Info "  ✓ Deno $(deno --version | Select-Object -First 1) found"

Write-Header "Downloading CortexPrism"
if (Test-Path (Join-Path $CORTEX_DIR ".git")) {
    Write-Host "$DIM  Updating existing installation...$NC"
    Push-Location $CORTEX_DIR
    git pull --ff-only --quiet origin $Branch
    Pop-Location
} else {
    Write-Host "$DIM  Target: $CORTEX_DIR$NC"
    New-Item -ItemType Directory -Force -Path $CORTEX_DIR | Out-Null
    git clone --depth 1 --quiet -b $Branch "https://github.com/${Repo}.git" $CORTEX_DIR
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorExit "Failed to clone repository. Check your internet connection."
    }
}

Push-Location $CORTEX_DIR

Write-Header "Initializing databases"
Write-Host "$DIM  Running migrations...$NC"
cmd /c "deno run --allow-all src/db/migrate.ts 2>nul"
if ($LASTEXITCODE -ne 0) {
    Write-Warn "  Migration step had warnings — this is usually fine for a first install"
}

Write-Info "  ✓ CortexPrism installed successfully!"

Pop-Location

Write-Header "Creating cortex command"
New-Item -ItemType Directory -Force -Path $BIN_DIR | Out-Null

$wrapper = "@echo off`r`ndeno run --allow-all `"$CORTEX_DIR\src\main.ts`" %*`r`n"
Set-Content -Path $CORTEX_WRAPPER -Value $wrapper
Write-Info "  ✓ cortex command created at $CORTEX_WRAPPER"

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$BIN_DIR*") {
    [Environment]::SetEnvironmentVariable("Path", "$BIN_DIR;$userPath", "User")
    Write-Warn "  Added $BIN_DIR to user PATH. Restart your terminal for changes to take effect."
}
$env:Path = "$BIN_DIR;$env:Path"

Write-Host @"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CortexPrism is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick start:

  cortex setup         Configure your LLM provider
  cortex chat           Start chatting
  cortex serve          Start web UI at http://localhost:3000

Documentation:
  https://cortexprism.io/getting-started
  https://cortexprism.io/docs/cli

Installed at: $CORTEX_DIR
Run with:     cortex <command>
Config:       ~\.cortex\config.json

"@
