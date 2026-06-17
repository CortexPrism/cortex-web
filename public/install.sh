#!/usr/bin/env bash
set -euo pipefail

REPO="${CORTEX_REPO:-CortexPrism/cortex}"
BRANCH="${CORTEX_BRANCH:-main}"
DENO_VERSION_REQUIRED="2"

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { printf "${GREEN}%s${NC}\n" "$*"; }
warn()  { printf "${YELLOW}WARN:${NC} %s\n" "$*"; }
error() { printf "${RED}ERROR:${NC} %s\n" "$*"; exit 1; }
header() { printf "\n${BOLD}${CYAN}==> %s${NC}\n" "$*"; }

detect_os() {
  case "$(uname -s)" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
    CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
    *)       echo "unknown" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64|AMD64) echo "x86_64" ;;
    aarch64|arm64|ARM64) echo "aarch64" ;;
    *)             echo "unknown" ;;
  esac
}

ensure_deno() {
  if command -v deno &>/dev/null; then
    local deno_ver
    deno_ver=$(deno --version 2>/dev/null | head -1 | grep -oP '\d+\.\d+' | head -1 || echo "0")
    if [[ "$(echo "$deno_ver" | cut -d. -f1)" -ge "$DENO_VERSION_REQUIRED" ]]; then
      info "  ✓ Deno $(deno --version | head -1) found"
      return 0
    fi
    warn "  Deno $(deno --version | head -1) is too old (need v${DENO_VERSION_REQUIRED}+)"
  fi

  header "Installing Deno v${DENO_VERSION_REQUIRED}+"
  printf "${DIM}  This may take a moment...${NC}\n"

  if command -v curl &>/dev/null; then
    curl -fsSL https://deno.land/install.sh | sh -s -- -y 2>/dev/null || {
      warn "  Default install failed, trying alternative..."
      export DENO_INSTALL="$HOME/.deno"
      curl -fsSL https://deno.land/install.sh | sh -s -- -y
    }
  elif command -v wget &>/dev/null; then
    wget -qO- https://deno.land/install.sh | sh -s -- -y
  else
    error "Need curl or wget to install Deno. Install manually: https://docs.deno.land/runtime/getting_started/installation"
  fi

  export DENO_INSTALL="$HOME/.deno"
  export PATH="$DENO_INSTALL/bin:$PATH"

  if ! command -v deno &>/dev/null; then
    error "Deno installation failed. Please install manually: https://docs.deno.land/runtime/getting_started/installation"
  fi
  info "  ✓ Deno $(deno --version | head -1) installed"
}

install_cortex() {
  local install_dir="${CORTEX_DIR:-$HOME/.cortex}"

  if [[ -d "$install_dir/.git" ]]; then
    header "Updating CortexPrism in ${install_dir}"
    cd "$install_dir"
    git pull --ff-only origin "$BRANCH" 2>/dev/null || {
      warn "  Git pull failed, backing up config and re-cloning..."
      cd "$HOME"
      # Backup config if it exists
      if [[ -f "$install_dir/config.json" ]]; then
        cp "$install_dir/config.json" /tmp/cortex-config-backup.json 2>/dev/null && \
        info "  ✓ Config backed up to /tmp/cortex-config-backup.json"
      fi
      rm -rf "$install_dir"
      git clone --depth 1 -b "$BRANCH" "https://github.com/${REPO}.git" "$install_dir"
      # Restore backed-up config
      if [[ -f /tmp/cortex-config-backup.json ]]; then
        mkdir -p "$install_dir"
        cp /tmp/cortex-config-backup.json "$install_dir/config.json" 2>/dev/null && \
        info "  ✓ Config restored from backup"
      fi
    }
  else
    header "Downloading CortexPrism"
    printf "${DIM}  Target: %s${NC}\n" "$install_dir"
    mkdir -p "$(dirname "$install_dir")"
    git clone --depth 1 -b "$BRANCH" "https://github.com/${REPO}.git" "$install_dir" 2>/dev/null || {
      error "Failed to clone repository. Check your internet connection."
    }
  fi

  cd "$install_dir"

  header "Initializing databases"
  printf "${DIM}  Running migrations...${NC}\n"
  deno run --allow-all src/db/migrate.ts 2>/dev/null || {
    warn "  Migration step had warnings — this is usually fine for a first install"
  }

  info ""
  info "  ✓ CortexPrism installed successfully!"
}

create_wrapper() {
  local install_dir="${CORTEX_DIR:-$HOME/.cortex}"
  local os
  os=$(detect_os)
  local bin_dir="${DENO_INSTALL:-$HOME/.deno}/bin"
  local wrapper="$bin_dir/cortex"

  header "Creating cortex command"
  mkdir -p "$bin_dir"

  if [[ "$os" == "windows" ]]; then
    printf '#!/bin/sh\nexec deno run --allow-all "%s/src/main.ts" "$@"\n' "$install_dir" > "$wrapper"
    chmod +x "$wrapper"
    printf '@echo off\r\ndeno run --allow-all "%s\\src\\main.ts" %%*\r\n' "$install_dir" > "$wrapper.bat"
    info "  ✓ cortex command created at $wrapper and $wrapper.bat"
  else
    printf '#!/bin/sh\nexec deno run --allow-all "%s/src/main.ts" "$@"\n' "$install_dir" > "$wrapper"
    chmod +x "$wrapper"
    info "  ✓ cortex command created at $wrapper"
  fi
}

print_next_steps() {
  local install_dir="${CORTEX_DIR:-$HOME/.cortex}"
  local os
  os=$(detect_os)

  printf "\n"
  printf "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${GREEN}  CortexPrism is ready!${NC}\n"
  printf "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "\n"

  if [[ "$os" == "windows" ]]; then
    if [[ ":$PATH:" != *":$HOME/.deno/bin:"* ]]; then
      printf "${YELLOW}  Add Deno to your PATH:${NC}\n"
      printf "    echo 'export PATH=\"\$HOME/.deno/bin:\$PATH\"' >> ~/.bashrc\n"
      printf "    source ~/.bashrc\n"
      printf "\n"
    fi
  elif [[ "$os" == "macos" ]]; then
    local shell_config="$HOME/.zshrc"
    [[ "$SHELL" == */bash* ]] && shell_config="$HOME/.bash_profile"
    if [[ ":$PATH:" != *":$HOME/.deno/bin:"* ]]; then
      printf "${YELLOW}  Add Deno to your PATH:${NC}\n"
      printf "    echo 'export PATH=\"\$HOME/.deno/bin:\$PATH\"' >> %s\n" "$shell_config"
      printf "    source %s\n" "$shell_config"
      printf "\n"
    fi
  else
    if [[ ":$PATH:" != *":$HOME/.deno/bin:"* ]]; then
      printf "${YELLOW}  Add Deno to your PATH:${NC}\n"
      printf "    echo 'export PATH=\"\$HOME/.deno/bin:\$PATH\"' >> ~/.bashrc\n"
      printf "    source ~/.bashrc\n"
      printf "\n"
    fi
  fi

  printf "${BOLD}Quick start:${NC}\n"
  printf "\n"
  printf "  ${GREEN}cortex setup${NC}         ${DIM}# Configure your LLM provider${NC}\n"
  printf "  ${GREEN}cortex chat${NC}           ${DIM}# Start chatting${NC}\n"
  printf "  ${GREEN}cortex serve${NC}          ${DIM}# Start web UI at http://localhost:3000${NC}\n"
  printf "\n"

  printf "${BOLD}Documentation:${NC}\n"
  printf "  ${CYAN}https://cortexprism.io/getting-started${NC}\n"
  printf "  ${CYAN}https://cortexprism.io/docs/cli${NC}\n"
  printf "\n"

  printf "${BOLD}${DIM}Installed at: %s${NC}\n" "$install_dir"
  printf "${DIM}Run with:     cortex <command>${NC}\n"
  printf "${DIM}Config:       ~/.cortex/config.json${NC}\n"
}

ensure_git() {
  if command -v git &>/dev/null; then
    info "  ✓ Git found"
    return 0
  fi

  local os
  os=$(detect_os)

  header "Installing Git"

  case "$os" in
    macos)
      xcode-select --install 2>/dev/null || true
      ;;
    linux)
      if command -v apt-get &>/dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq git
      elif command -v dnf &>/dev/null; then
        sudo dnf install -y git
      elif command -v yum &>/dev/null; then
        sudo yum install -y git
      elif command -v pacman &>/dev/null; then
        sudo pacman -S --noconfirm git
      elif command -v apk &>/dev/null; then
        apk add git
      else
        error "Git is required. Please install: https://git-scm.com/downloads"
      fi
      ;;
    windows)
      if command -v winget &>/dev/null; then
        winget install --id Git.Git -e --source winget
      elif command -v choco &>/dev/null; then
        choco install git
      elif command -v scoop &>/dev/null; then
        scoop install git
      else
        error "Git for Windows is required. Install from https://git-scm.com/download/win"
      fi
      ;;
  esac

  if ! command -v git &>/dev/null; then
    error "Git installation failed. Please install manually and re-run this installer."
  fi
  info "  ✓ Git installed"
}

main() {
  printf "\n"
  printf "${BOLD}${CYAN}  ╔══════════════════════════════════════╗${NC}\n"
  printf "${BOLD}${CYAN}  ║       CortexPrism Installer         ║${NC}\n"
  printf "${BOLD}${CYAN}  ║   Open-Source Agentic Harness       ║${NC}\n"
  printf "${BOLD}${CYAN}  ╚══════════════════════════════════════╝${NC}\n"
  printf "\n"

  local os
  os=$(detect_os)
  info "  System:  $(uname -s) $(uname -m)"

  ensure_git
  ensure_deno
  install_cortex
  create_wrapper
  print_next_steps
}

main
