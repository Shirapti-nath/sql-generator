#!/usr/bin/env bash
# Deploy PyForge to Vercel (run from pyforge/frontend after `npx vercel login`)
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Deploying PyForge to Vercel..."
echo "  Ensure you have run: npx vercel login"
echo "  Ensure Redis/KV is connected in the Vercel dashboard."
echo ""

if [[ -z "${JWT_SECRET:-}" ]]; then
  echo "Tip: set JWT_SECRET in Vercel → Settings → Environment Variables"
fi

npx vercel --prod "$@"

echo ""
echo "Done. Set NEXT_PUBLIC_APP_URL to your production URL and redeploy if needed."
