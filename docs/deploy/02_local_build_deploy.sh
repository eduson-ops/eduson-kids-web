#!/usr/bin/env bash
###############################################################################
# KubiK — Local Build & Deploy (Windows Git Bash)
# Run from: c:/Users/being/Desktop/R&D/src/
# Prereq: VDS already set up (01_setup_vds.sh ran successfully)
###############################################################################
set -euo pipefail

DEPLOY_USER="kubik"
VDS_IP="45.131.40.181"
WEB_ROOT="/var/www/kubik"

cd "$(dirname "$0")/../.." 2>/dev/null || cd "c:/Users/being/Desktop/R&D/src"

echo "════════════════════════════════════════════════════════════"
echo " KubiK — local build & deploy"
echo " Target: $DEPLOY_USER@$VDS_IP:$WEB_ROOT"
echo "════════════════════════════════════════════════════════════"

# ─── 1. Install deps ──────────────────────────────────────────────────────────
if [ ! -d node_modules ] || [ ! -e node_modules/vite/package.json ]; then
    echo ">>> [1/4] Installing dependencies (legacy-peer-deps)..."
    npm install --legacy-peer-deps
else
    echo ">>> [1/4] Dependencies already installed (skip)"
fi

# ─── 2. Build for axsa.tech ───────────────────────────────────────────────────
echo ">>> [2/4] Building for axsa.tech (target=axsa, base=/)..."
rm -rf dist
VITE_TARGET=axsa \
VITE_API_BASE=/api/v1 \
VITE_DEMO_SEED=true \
node node_modules/vite/bin/vite.js build

if [ ! -f dist/index.html ]; then
    echo "ERROR: dist/index.html not found — build failed"
    exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
echo "    ✓ Build done — dist/ is $DIST_SIZE"

# ─── 3. Verify Pyodide is in dist/ ────────────────────────────────────────────
if [ ! -d dist/pyodide ]; then
    echo "WARNING: dist/pyodide/ missing — Python won't work."
    echo "         Copying from public/pyodide manually..."
    cp -r public/pyodide dist/pyodide
fi
PY_SIZE=$(du -sh dist/pyodide 2>/dev/null | cut -f1 || echo "—")
echo "    ✓ Pyodide bundle: $PY_SIZE"

# ─── 4. Rsync to VDS ──────────────────────────────────────────────────────────
echo ">>> [3/4] Uploading dist/ to VDS via rsync..."
echo "    (you'll be prompted for $DEPLOY_USER's password)"

rsync -avz --delete \
    --exclude='.DS_Store' \
    --exclude='*.map' \
    -e "ssh -o StrictHostKeyChecking=accept-new" \
    dist/ \
    "$DEPLOY_USER@$VDS_IP:$WEB_ROOT/"

# ─── 5. Reload nginx (sudoers entry allows this without password) ─────────────
echo ">>> [4/4] Reloading nginx on VDS..."
ssh "$DEPLOY_USER@$VDS_IP" "sudo systemctl reload nginx" || echo "    (skipped — reload manually if needed)"

# ─── DONE ─────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo " ✓ Deploy complete"
echo "════════════════════════════════════════════════════════════"
echo ""
echo " Test URLs:"
echo "   http://$VDS_IP/__health         → should return 'ok'"
echo "   https://axsa.tech/              → should prompt Basic Auth, then load Studio"
echo "   https://axsa.tech/api/v1/health → should proxy to Yandex Cloud backend"
echo ""
echo " If 502: backend Yandex Cloud URL changed, check /etc/nginx/sites-available/kubik"
echo " If blank page: check browser console for /assets/ 404s"
echo "════════════════════════════════════════════════════════════"
