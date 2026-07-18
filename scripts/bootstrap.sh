#!/usr/bin/env bash
# =============================================================================
# bootstrap.sh — developer machine readiness check (DevOps hardening, Phase 7).
#
# Verifies a new developer's machine has the tools + configuration to build,
# run, and test PanchangPal. Read-only: it INSTALLS NOTHING and changes no
# files — it reports PASS / WARN / FAIL and an overall readiness percentage,
# then points you at docs/SETUP.md for anything missing.
#
#   Usage: scripts/bootstrap.sh
#
# Exit codes: 0 = no hard failures; 1 = one or more required tools missing.
# =============================================================================
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; WARN=0; FAIL=0

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  RED=$'\033[31m'; GRN=$'\033[32m'; YEL=$'\033[33m'; BLD=$'\033[1m'; DIM=$'\033[2m'; RST=$'\033[0m'
else RED=""; GRN=""; YEL=""; BLD=""; DIM=""; RST=""; fi

row() { # status, label, detail
  local s="$1" label="$2" detail="${3:-}"
  case "$s" in
    PASS) printf "  %s✓%s  %-22s %s%s%s\n" "$GRN" "$RST" "$label" "$DIM" "$detail" "$RST"; PASS=$((PASS+1));;
    WARN) printf "  %s!%s  %-22s %s%s%s\n" "$YEL" "$RST" "$label" "$DIM" "$detail" "$RST"; WARN=$((WARN+1));;
    FAIL) printf "  %s✗%s  %-22s %s%s%s\n" "$RED" "$RST" "$label" "$DIM" "$detail" "$RST"; FAIL=$((FAIL+1));;
  esac
}

# require: FAIL if absent | optional: WARN if absent
have() { command -v "$1" >/dev/null 2>&1; }
ver()  { "$1" --version 2>/dev/null | head -1; }

check_required() { if have "$1"; then row PASS "$2" "$(ver "$1")"; else row FAIL "$2" "missing — ${3:-see docs/SETUP.md}"; fi; }
check_optional() { if have "$1"; then row PASS "$2" "$(ver "$1")"; else row WARN "$2" "missing — ${3:-optional}"; fi; }

printf "%s╔══════════════════════════════════════╗%s\n" "$BLD" "$RST"
printf "%s║        PanchangPal Bootstrap         ║%s\n" "$BLD" "$RST"
printf "%s╚══════════════════════════════════════╝%s\n" "$BLD" "$RST"

printf "\n%sCore toolchain%s\n" "$BLD" "$RST"
check_required git   "Git"    "install Git"
check_required node  "Node"   "install Node >= 20.11.0 (see .nvmrc)"
check_required pnpm  "pnpm"   "corepack enable && corepack prepare pnpm@9.6.0 --activate"

# Node version gate (repo requires >= 20.11.0)
if have node; then
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [[ "${NODE_MAJOR:-0}" -ge 20 ]]; then row PASS "Node >= 20" "$(node -v)"; else row FAIL "Node >= 20" "found $(node -v); need >= 20.11.0"; fi
fi

printf "\n%sBackend / database%s\n" "$BLD" "$RST"
check_required supabase "Supabase CLI" "brew install supabase/tap/supabase"
check_optional psql     "psql"         "postgresql-client — needed for migrate.sh / pgTAP"
check_optional pg_prove "pg_prove"     "pgTAP client — needed for DB test suites"
check_optional deno     "Deno"         "only needed to run Edge Functions locally"

printf "\n%sMobile / release%s\n" "$BLD" "$RST"
check_optional expo     "Expo CLI"     "npx expo works without a global install"
check_optional eas      "EAS CLI"      "npm i -g eas-cli — needed for builds/OTA"
check_optional watchman "Watchman"     "recommended for RN file watching"
check_optional java     "Java (JDK)"   "needed for Android builds"
case "$(uname -s)" in
  Darwin) if have xcodebuild; then row PASS "Xcode" "$(xcodebuild -version 2>/dev/null | head -1)"; else row WARN "Xcode" "needed for iOS builds (macOS)"; fi
          check_optional adb "Android SDK (adb)" "needed for Android builds" ;;
  *)      row WARN "Xcode" "n/a on $(uname -s) — iOS builds require macOS"
          check_optional adb "Android SDK (adb)" "needed for Android builds" ;;
esac

printf "\n%sWorkspace state%s\n" "$BLD" "$RST"
[[ -d "$ROOT/node_modules" ]] && row PASS "Dependencies" "node_modules present" || row WARN "Dependencies" "run: pnpm install"
[[ -f "$ROOT/apps/mobile/.env" ]] && row PASS "Mobile env" "apps/mobile/.env present" || row WARN "Mobile env" "copy from .env.local.example → apps/mobile/.env"

printf "\n%sEnvironment / secrets (local, optional)%s\n" "$BLD" "$RST"
present() { [[ -n "${!1:-}" ]] && row PASS "$1" "set" || row WARN "$1" "unset — ${2}"; }
present EXPO_PUBLIC_SUPABASE_URL      "app cannot reach a backend without it"
present EXPO_PUBLIC_SUPABASE_ANON_KEY "needed for the app to authenticate"
present OPENAI_API_KEY               "only for local ask-guru/content-ingest"
if have supabase; then
  if supabase projects list >/dev/null 2>&1; then row PASS "Supabase login" "authenticated"; else row WARN "Supabase login" "run: supabase login"; fi
fi

# ---- score ------------------------------------------------------------------
TOTAL=$((PASS+WARN+FAIL))
PCT=0; [[ $TOTAL -gt 0 ]] && PCT=$(( PASS * 100 / TOTAL ))
printf "\n%s────────────────────────────────────────%s\n" "$DIM" "$RST"
printf "  %sPASS%s %d   %sWARN%s %d   %sFAIL%s %d\n" "$GRN" "$RST" "$PASS" "$YEL" "$RST" "$WARN" "$RED" "$RST" "$FAIL"
printf "  %sOverall readiness: %s%d%%%s\n" "$BLD" "$([[ $FAIL -gt 0 ]] && echo "$RED" || echo "$GRN")" "$PCT" "$RST"

if [[ $FAIL -gt 0 ]]; then
  printf "\n%s✗ %d required tool(s) missing. See docs/SETUP.md → Prerequisites.%s\n" "$RED" "$FAIL" "$RST"
  exit 1
fi
printf "\n%s✓ Core toolchain ready.%s %sAddress WARN items as you need them (docs/SETUP.md).%s\n" "$GRN" "$RST" "$DIM" "$RST"
exit 0
