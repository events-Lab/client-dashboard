#!/usr/bin/env bash
# Vercel clones this repo alone. Pull the public shared UI package into the
# project so Next can compile it without tracing files outside the deployment.
set -euo pipefail

app_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$app_dir"

if [ -n "${VERCEL:-}" ]; then
  rm -rf vendor/shared-compoenents
  mkdir -p vendor
  git clone --depth 1 https://github.com/events-Lab/shared-compoenents.git vendor/shared-compoenents
  npm pkg set 'dependencies.@events-lab/shared-components=file:vendor/shared-compoenents'
fi

npm install --include=dev
