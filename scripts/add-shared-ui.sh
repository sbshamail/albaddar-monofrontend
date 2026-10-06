#!/usr/bin/env bash
# Adds a shadcn/ui component via admin's real components.json, then moves the
# newly created files into shared/ and rewrites their `@/...` imports to
# relative paths (shared/ has no bundler of its own — see shared/AGENTS.md).
#
# Usage: scripts/add-shared-ui.sh <component> [component...]
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: scripts/add-shared-ui.sh <component> [component...]" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin"
SHARED_DIR="$ROOT_DIR/shared"

before="$(mktemp)"
after="$(mktemp)"
trap 'rm -f "$before" "$after"' EXIT

scan_dirs=()
for d in "$ADMIN_DIR/components" "$ADMIN_DIR/hooks" "$ADMIN_DIR/lib"; do
  [ -d "$d" ] && scan_dirs+=("$d")
done

find "${scan_dirs[@]}" -type f | sort > "$before"

(cd "$ADMIN_DIR" && npx shadcn@latest add "$@")

find "${scan_dirs[@]}" -type f | sort > "$after"

new_files="$(comm -13 "$before" "$after")"

if [ -z "$new_files" ]; then
  echo "No new files were created — component(s) may already exist in admin/." >&2
  exit 1
fi

echo
echo "New files from shadcn add:"
echo "$new_files"
echo

moved_rel=()
while IFS= read -r f; do
  rel="${f#"$ADMIN_DIR"/}"
  dest="$SHARED_DIR/$rel"
  mkdir -p "$(dirname "$dest")"
  mv "$f" "$dest"
  node "$ROOT_DIR/scripts/rewrite-shared-imports.js" "$dest"
  moved_rel+=("$rel")
  echo "moved: $rel -> shared/$rel"
done <<< "$new_files"

echo
echo "Checking for leftover @/ imports..."
leftover=0
for rel in "${moved_rel[@]}"; do
  dest="$SHARED_DIR/$rel"
  if grep -n '@/' "$dest" > /dev/null 2>&1; then
    echo "LEFTOVER @/ import in shared/$rel:"
    grep -n '@/' "$dest"
    leftover=1
  fi
done

if [ "$leftover" -eq 1 ]; then
  echo
  echo "Fix the leftover import(s) above by hand — an unresolved @/ import inside" >&2
  echo "shared/ builds clean locally but silently breaks in whichever app consumes it." >&2
  exit 1
fi

echo
echo "Done. Import these from '@deep-ecommerce/shared/...' in admin/frontend,"
echo "not from the old '@/components/ui/...' path."
