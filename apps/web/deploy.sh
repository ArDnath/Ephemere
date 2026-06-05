#!/bin/bash

set -euo pipefail

ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "${SCRIPT_DIR}"

prod_flag=()
case "${ENVIRONMENT}" in
  production|prod)
    prod_flag=(--prod)
    ;;
  preview)
    ;;
  *)
    echo "Usage: ./deploy.sh [production|preview]"
    exit 1
    ;;
esac

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed or not available on PATH."
  echo "Install it, or run this script through pnpm if vercel is a project dependency."
  exit 1
fi

echo "Building frontend locally for ${ENVIRONMENT}..."
vercel build --standalone "${prod_flag[@]}"

echo "Deploying prebuilt frontend to Vercel..."
vercel deploy --prebuilt --archive=tgz "${prod_flag[@]}"
