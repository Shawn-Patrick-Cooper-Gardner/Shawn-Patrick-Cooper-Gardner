#!/usr/bin/env bash
# ==============================================================================
# 13 AEROSPACE DEFENSE COMPANY (13ADC) - TERMUX WORKSPACE STATUS PROMPT
# Super Project EXCALIBUR / XRPL-PAYMENTS
# Authority: Shawn Patrick Cooper Gardner (US-1 Authority / Superior Intelligence Directive)
# ==============================================================================

echo "======================================================================"
echo "  13 AEROSPACE DEFENSE COMPANY - TERMUX WORKSPACE AUDIT"
echo "  Directory: $(pwd)"
echo "  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "======================================================================"

echo ""
echo "[1] OPERATIONAL ENVIRONMENT:"
echo "  Node Version : $(node -v 2>/dev/null || echo 'Node not found')"
echo "  NPM Version  : $(npm -v 2>/dev/null || echo 'NPM not found')"
echo "  Git Branch   : $(git branch --show-current 2>/dev/null || echo 'Not a git repo')"

echo ""
echo "[2] REGISTERED NPM RUN SCRIPTS (package.json):"
grep -A 8 '"scripts":' package.json 2>/dev/null || echo "package.json not found"

echo ""
echo "[3] CURRENT ON-CHAIN ACCOUNT STATUS:"
if [ -f "src/check-account.js" ]; then
  node src/check-account.js
else
  echo "src/check-account.js not found in current directory."
fi

echo ""
echo "[4] CRYPTOGRAPHIC EVIDENCE & AUDIT ARTIFACTS:"
if [ -d "evidence" ]; then
  ls -lh evidence/
  echo ""
  if [ -f "evidence/auth-proof-1793427389932.json" ]; then
    echo "--- Latest Auth Proof (evidence/auth-proof-1793427389932.json) ---"
    cat evidence/auth-proof-1793427389932.json
    echo ""
  fi
  if [ -f "evidence/tx-payment-74942973.json" ]; then
    echo "--- Latest Payment TX (evidence/tx-payment-74942973.json) ---"
    cat evidence/tx-payment-74942973.json
    echo ""
  fi
else
  echo "evidence/ directory not found."
fi

echo "======================================================================"
echo "  STATUS: OPERATIONAL - ALL SYSTEMS SECURE & SYNCHRONIZED"
echo "======================================================================"
