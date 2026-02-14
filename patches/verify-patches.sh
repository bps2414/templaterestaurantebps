#!/usr/bin/env bash
# ============================================================
# verify-patches.sh — Verifica se os patches foram aplicados corretamente
# Uso: bash patches/verify-patches.sh
# ============================================================
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    if [ "$result" = "ok" ]; then
        echo "  ✅ $desc"
        PASS=$((PASS+1))
    else
        echo "  ❌ $desc"
        FAIL=$((FAIL+1))
    fi
}

echo "=========================================="
echo "  UX Patch Verification"
echo "=========================================="

# P1 — Script tags in HTMLs
echo ""
echo "▶ P1: Script tags check"
for f in public/index.html public/menu.html public/about.html public/contact.html public/gallery.html; do
    if [ -f "$f" ]; then
        grep -q 'feedback\.js' "$f" && check "$f has feedback.js" "ok" || check "$f has feedback.js" "fail"
        grep -q 'formValidation\.js' "$f" && check "$f has formValidation.js" "ok" || check "$f has formValidation.js" "fail"
    fi
done

# P3 — orderModal integration
echo ""
echo "▶ P3: orderModal.js integration"
f="public/js/orderModal.js"
grep -q '_initFormValidation' "$f" && check "has _initFormValidation" "ok" || check "has _initFormValidation" "fail"
grep -q '_formValidator' "$f" && check "has _formValidator" "ok" || check "has _formValidator" "fail"
grep -q 'aria-busy' "$f" && check "has aria-busy" "ok" || check "has aria-busy" "fail"
grep -q 'Processando' "$f" && check "has 'Processando...' text" "ok" || check "has 'Processando...' text" "fail"
grep -q 'window\.feedback' "$f" && check "has window.feedback in _showToast" "ok" || check "has window.feedback in _showToast" "fail"

# P5 — Toast refactor
echo ""
echo "▶ P5: app.js toast refactor"
f="public/js/app.js"
grep -q 'window\.feedback\.success' "$f" && check "showAddToCartToast uses feedback.success" "ok" || check "showAddToCartToast uses feedback.success" "fail"
grep -q 'feedback\.js.*showToast' "$f" 2>/dev/null || grep -q 'Toast system.*feedback\.js' "$f" && check "showToast comment updated" "ok" || check "showToast comment updated" "fail"

# P9 — cartUI focus trap
echo ""
echo "▶ P9: cartUI.js focus trap"
f="public/js/cartUI.js"
grep -q '_lastFocusedElement' "$f" && check "has _lastFocusedElement" "ok" || check "has _lastFocusedElement" "fail"
grep -q 'focus.*trap\|Tab.*shiftKey\|Shift.*Tab' "$f" 2>/dev/null || grep -q 'e.shiftKey' "$f" && check "has focus trap (Tab handling)" "ok" || check "has focus trap (Tab handling)" "fail"
grep -q 'Fechar carrinho' "$f" && check "auto-focus close button" "ok" || check "auto-focus close button" "fail"

# P6 — Admin login UX
echo ""
echo "▶ P6: admin.html login protection"
f="public/admin.html"
grep -q 'login-btn' "$f" && check "has login-btn id" "ok" || check "has login-btn id" "fail"
grep -q 'login-btn-text' "$f" && check "has login-btn-text span" "ok" || check "has login-btn-text span" "fail"
grep -q 'isLoginSubmitting' "$f" && check "has isLoginSubmitting guard" "ok" || check "has isLoginSubmitting guard" "fail"
grep -q 'aria-busy' "$f" && check "has aria-busy on login btn" "ok" || check "has aria-busy on login btn" "fail"
grep -q 'animate-spin' "$f" && check "has spinner SVG" "ok" || check "has spinner SVG" "fail"
grep -q '429' "$f" && check "has 429 rate-limit handling" "ok" || check "has 429 rate-limit handling" "fail"

# P10 — Security headers
echo ""
echo "▶ P10: server security headers"
f="server/src/app.ts"
grep -q 'Expect-CT' "$f" && check "has Expect-CT header" "ok" || check "has Expect-CT header" "fail"
grep -q 'Cross-Origin-Opener-Policy' "$f" && check "has COOP header" "ok" || check "has COOP header" "fail"
grep -q 'Cross-Origin-Resource-Policy' "$f" && check "has CORP header" "ok" || check "has CORP header" "fail"
grep -q 'Content-Security-Policy-Report-Only' "$f" && check "has CSP-Report-Only" "ok" || check "has CSP-Report-Only" "fail"

# P11 — Skeletons
echo ""
echo "▶ P11: app.js skeletons"
f="public/js/app.js"
grep -q 'feedback\.skeletons\.featuredCards' "$f" && check "has featuredCards skeleton" "ok" || check "has featuredCards skeleton" "fail"
grep -q 'feedback\.skeletons\.categoryCards' "$f" && check "has categoryCards skeleton" "ok" || check "has categoryCards skeleton" "fail"

# Summary
echo ""
echo "=========================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "=========================================="

if [ "$FAIL" -gt 0 ]; then
    echo "  ⚠ Some checks failed. Review patches manually."
    exit 1
else
    echo "  🎉 All checks passed!"
    exit 0
fi
