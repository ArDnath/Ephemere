#!/bin/bash

set -euo pipefail

ENV_NAME="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.${ENV_NAME}.secrets"

cd "${SCRIPT_DIR}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing ${ENV_FILE}."
  echo "Create it from .env.example, then run: pnpm deploy --env ${ENV_NAME}"
  exit 1
fi

echo "Setting Cloudflare Worker secrets for ${ENV_NAME}..."

set -a
source "${ENV_FILE}"
set +a

required_keys=(
  DATABASE_URL
  JWT_SECRET
  FRONTEND_URL
  RESEND_API_KEY
  RESEND_FROM_EMAIL
)

missing_keys=()
for key in "${required_keys[@]}"; do
  value="${!key:-}"
  if [ -z "${value}" ]; then
    missing_keys+=("${key}")
  fi
done

if [ "${#missing_keys[@]}" -gt 0 ]; then
  echo "Missing required secrets in ${ENV_FILE}: ${missing_keys[*]}"
  exit 1
fi

for key in \
  DATABASE_URL \
  JWT_SECRET \
  FRONTEND_URL \
  RESEND_API_KEY \
  RESEND_FROM_EMAIL \
  CLOUDFLARE_R2_ACCESS_KEY_ID \
  CLOUDFLARE_R2_SECRET_ACCESS_KEY \
  CLOUDFLARE_R2_ENDPOINT \
  CLOUDFLARE_R2_BUCKET_NAME \
  CDN_URL \
  GOOGLE_CLIENT_ID \
  GOOGLE_CLIENT_SECRET \
  GITHUB_CLIENT_ID \
  GITHUB_CLIENT_SECRET \
  RAZORPAY_KEY_ID \
  RAZORPAY_KEY_SECRET
do
  value="${!key:-}"
  if [ -n "${value}" ]; then
    printf '%s' "${value}" | pnpm exec wrangler secret put "${key}" --env "${ENV_NAME}"
  fi
done

pnpm exec wrangler deploy --env "${ENV_NAME}"
