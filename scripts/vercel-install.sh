#!/usr/bin/env bash
# Vercel clones this repo by itself. The shared UI package lives in a sibling
# repository, so recreate the local workspace layout before installing.
set -euo pipefail

app_dir="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${VERCEL:-}" ]; then
  cd "$app_dir"
  npm install
  exit 0
fi

parent="$(dirname "$app_dir")"
base="$(basename "$app_dir")"
shared="$parent/shared-compoenents"

rm -rf "$shared"
git clone --depth 1 https://github.com/events-Lab/shared-compoenents.git "$shared"

cat > "$parent/package.json" << EOF
{
  "name": "events-lab",
  "private": true,
  "workspaces": ["shared-compoenents", "$base"]
}
EOF

cd "$parent"
npm install --include=dev
