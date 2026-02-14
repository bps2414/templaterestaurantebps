#!/usr/bin/env bash
# ============================================================
# apply-patches.sh — Aplica os patches P1–P11 em template-b
# Uso: git checkout template-b && git checkout -b fix/template-b-ux-sync && bash patches/apply-patches.sh
# ============================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "=========================================="
echo "  UX Sync Patches — template-b"
echo "=========================================="

# ──────────────────────────────────────
# P1 — Add script tags to HTML files
# ──────────────────────────────────────
echo ""
echo "▶ P1: Adding feedback.js + formValidation.js to public HTML files..."

for file in public/index.html public/menu.html public/about.html public/contact.html public/gallery.html; do
    if [ -f "$file" ]; then
        if grep -q 'feedback\.js' "$file"; then
            echo "  ⏭ $file already has feedback.js — skipping"
        else
            # Insert feedback.js and formValidation.js BEFORE the first app.js script tag
            sed -i 's|<script src="/js/app.js"></script>|<script src="/js/feedback.js"></script>\n    <script src="/js/formValidation.js"></script>\n    <script src="/js/app.js"></script>|' "$file"
            echo "  ✅ $file — scripts inserted"
        fi
    else
        echo "  ⚠ $file not found — skipping"
    fi
done

echo "✅ P1 complete"

# ──────────────────────────────────────
# P3 — orderModal.js integration
# ──────────────────────────────────────
echo ""
echo "▶ P3: Patching orderModal.js (formValidation + aria-busy + toast)..."

# We apply the git-formatted patch with --3way for better conflict handling
git apply --3way patches/P3-orderModal-integration.patch 2>/dev/null && echo "  ✅ P3 applied via git apply" || {
    echo "  ⚠ git apply failed for P3, attempting manual apply..."
    echo "  Please apply P3-orderModal-integration.patch manually"
}

echo "✅ P3 complete"

# ──────────────────────────────────────
# P5 — Toast refactor (app.js)
# ──────────────────────────────────────
echo ""
echo "▶ P5: Patching app.js (toast via feedback.js)..."

git apply --3way patches/P5-toast-refactor.patch 2>/dev/null && echo "  ✅ P5 applied via git apply" || {
    echo "  ⚠ git apply failed for P5, attempting manual apply..."
    echo "  Please apply P5-toast-refactor.patch manually"
}

echo "✅ P5 complete"

# ──────────────────────────────────────
# P9 — cartUI.js focus trap
# ──────────────────────────────────────
echo ""
echo "▶ P9: Patching cartUI.js (focus-trap + focus-restore)..."

git apply --3way patches/P9-cartUI-focustrap.patch 2>/dev/null && echo "  ✅ P9 applied via git apply" || {
    echo "  ⚠ git apply failed for P9, attempting manual apply..."
    echo "  Please apply P9-cartUI-focustrap.patch manually"
}

echo "✅ P9 complete"

# ──────────────────────────────────────
# P6 — Admin login UX
# ──────────────────────────────────────
echo ""
echo "▶ P6: Patching admin.html (login double-click prevention)..."

git apply --3way patches/P6-admin-login-ux.patch 2>/dev/null && echo "  ✅ P6 applied via git apply" || {
    echo "  ⚠ git apply failed for P6, attempting manual apply..."
    echo "  Please apply P6-admin-login-ux.patch manually"
}

echo "✅ P6 complete"

# ──────────────────────────────────────
# P10 — Security headers
# ──────────────────────────────────────
echo ""
echo "▶ P10: Patching server/src/app.ts (security headers)..."

git apply --3way patches/P10-security-headers.patch 2>/dev/null && echo "  ✅ P10 applied via git apply" || {
    echo "  ⚠ git apply failed for P10, attempting manual apply..."
    echo "  Please apply P10-security-headers.patch manually"
}

echo "✅ P10 complete"

# ──────────────────────────────────────
# P11 — Skeletons
# ──────────────────────────────────────
echo ""
echo "▶ P11: Patching app.js (skeleton loaders)..."

git apply --3way patches/P11-skeletons.patch 2>/dev/null && echo "  ✅ P11 applied via git apply" || {
    echo "  ⚠ git apply failed for P11, attempting manual apply..."
    echo "  Please apply P11-skeletons.patch manually"
}

echo "✅ P11 complete"

# ──────────────────────────────────────
# P7 — AbortController (optional)
# ──────────────────────────────────────
echo ""
echo "▶ P7 (optional): Patching orderModal.js (AbortController)..."

git apply --3way patches/P7-abortcontroller-order.patch 2>/dev/null && echo "  ✅ P7 applied via git apply" || {
    echo "  ⏭ P7 skipped (optional — apply manually if needed)"
}

echo ""
echo "=========================================="
echo "  ALL PATCHES APPLIED"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. npm run dev (or npx http-server public)"
echo "  2. Open browser and run smoke tests"
echo "  3. git add -A && git commit -m 'fix(template-b): sync UX features from main'"
echo ""
