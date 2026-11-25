#!/usr/bin/env bash
#
# generate_daily_report.sh
# --------------------------
# Project: LearnStream — Vite + Vue 3 + Vue Router + @nuxt/ui (sources in src/).
# Implements the "daily-progress-report" skill rules defined in report_agent.md.
#
# Behavior:
#   1. Processes the current report (daily_progress_report.md) if present.
#   2. Detects what changed in the repository (git when available, otherwise a
#      fallback to files modified since the start of today).
#   3. Writes the report to report_YYYY-MM-DD.md using the exact
#      template from report_agent.md.
#   4. Prints the path it wrote back to the user.
#
# Runnable from the project directory:
#   ./daily_report/generate_daily_report.sh
#
set -euo pipefail

# --- Locations -------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# Current report (the one the skill maintains / "processes").
CURRENT_REPORT="$SCRIPT_DIR/daily_progress_report.md"

# Where the dated report is written (override with OUT_DIR=...).
OUT_DIR="${OUT_DIR:-$SCRIPT_DIR}"

# --- Dates -----------------------------------------------------------------
DATE_ISO="$(date +%Y-%m-%d)"
DATE_HUMAN="$(date +'%B %-d, %Y (%A)')"
# Start of the current day — the window the report covers.
DAY_START="$(date +'%Y-%m-%d 00:00:00')"

OUT_FILE="$OUT_DIR/report_${DATE_ISO}.md"

# --- Helpers ---------------------------------------------------------------
# Project display name: package.json "name", else the directory name.
project_name() {
  local pkg="$PROJECT_ROOT/package.json"
  if [ -f "$pkg" ]; then
    local n
    n="$(sed -n 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$pkg" | head -n1)"
    [ -n "$n" ] && { printf '%s' "$n"; return; }
  fi
  basename "$PROJECT_ROOT"
}

# Map a file path to a status + type label (see "Report rules").
classify() {
  local path="$1" status="$2"
  local type="Change"
  case "$path" in
    *.md) type="Documentation" ;;
    *.css) type="Config" ;;
    *.sh|*vite.config.ts|*tsconfig.json|*.json|*.yaml|*.yml|*.env*|*.html|.gitignore) type="Config" ;;
    *.vue) type="Feature" ;;
    *.ts|*.js) type="Feature" ;;
  esac
  printf '%s|%s' "$status" "$type"
}

# --- Process the current report --------------------------------------------
SUMMARY=""
LINK_LINE=""
if [ -f "$CURRENT_REPORT" ]; then
  SUMMARY="$(grep -m1 '🔎 Summary:' "$CURRENT_REPORT" 2>/dev/null | sed 's/^.*🔎 Summary:[[:space:]]*//' || true)"
  LINK_LINE="$(grep -m1 '^🔗' "$CURRENT_REPORT" 2>/dev/null || true)"
fi

# --- Detect what changed ---------------------------------------------------
HAS_GIT=0
if git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  HAS_GIT=1
fi

# Collect changed files as "STATUS<TAB>RELPATH" lines.
CHANGES="$(mktemp)"
trap 'rm -f "$CHANGES"' EXIT

if [ "$HAS_GIT" -eq 1 ]; then
  # git status --short: first column status, rest the path.
  git -C "$PROJECT_ROOT" status --short | while IFS= read -r line; do
    [ -n "$line" ] || continue
    code="${line:0:2}"
    path="${line:3}"
    case "$code" in
      "??"|"A "*|" A") status="[ADDED]" ;;
      "D "*|" D") status="[REMOVED]" ;;
      *) status="[UPDATED]" ;;
    esac
    printf '%s\t%s\n' "$status" "$path"
  done > "$CHANGES"
else
  # Fallback: files modified since the start of today, excluding build/dependency dirs.
  find "$PROJECT_ROOT" -type f -newermt "$DAY_START" \
    -not -name ".DS_Store" \
    -not -name "report_????-??-??.md" \
    -not -name "auto-imports.d.ts" \
    -not -name "components.d.ts" \
    -not -name "tsconfig.tsbuildinfo" \
    -not -path "*/.git/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.cache/*" \
    -not -path "*/dist/*" \
    -not -path "*/.trae-html-share-packages/*" \
    | while IFS= read -r f; do
        printf '[UPDATED]\t%s\n' "${f#"$PROJECT_ROOT"/}"
      done | sort > "$CHANGES"
fi

# --- Build the report ------------------------------------------------------
LINK_REMOTE=""
if [ "$HAS_GIT" -eq 1 ]; then
  LINK_REMOTE="$(git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null || true)"
fi

if [ -z "$SUMMARY" ]; then
  COUNT="$(wc -l < "$CHANGES" | tr -d ' ')"
  SUMMARY="Session on ${DATE_HUMAN}: ${COUNT} file(s) changed in the $(project_name) project."
fi

{
  printf '📋 Daily Progress Report : %s\n' "$(project_name)"
  printf 'Date: %s\n\n' "$DATE_HUMAN"
  printf '🔎 Summary: %s\n\n' "$SUMMARY"
  printf 'Detailed File Changes ᝰ✍🏻 .ᐟ\n\n'

  if [ -s "$CHANGES" ]; then
    # Newest work first: reverse the detected order.
    sort -r "$CHANGES" | while IFS=$'\t' read -r status path; do
      [ -n "$path" ] || continue
      cls="$(classify "$path" "$status")"
      st="${cls%%|*}"
      ty="${cls##*|}"
      printf '♻️ %s | %s |\n' "$st" "$ty"
      printf '📁 File: `%s`\n' "$path"
      printf -- '- Changed on %s (detected via %s).\n\n' "$DATE_ISO" "$([ "$HAS_GIT" -eq 1 ] && echo git || echo filesystem)"
    done
  else
    printf 'No changes detected for %s.\n\n' "$DATE_ISO"
  fi

  printf 'Link:\n'
  if [ -n "$LINK_REMOTE" ]; then
    printf '🔗 [%s](%s)\n' "$LINK_REMOTE" "$LINK_REMOTE"
  elif [ -n "$LINK_LINE" ]; then
    printf '%s\n' "$LINK_LINE"
  else
    printf '🔗 (no remote configured)\n'
  fi
} > "$OUT_FILE"

echo "Wrote report: $OUT_FILE"
