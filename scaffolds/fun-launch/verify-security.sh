#!/bin/bash

# 🔐 Pre-Deployment Security Verification Script
# Run this before deploying to Cloudflare Pages

echo "🔐 Starting Security Verification..."
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: .env files not committed
echo "📁 Checking if .env files are in git..."
if git ls-files | grep -E "\.env(\.local|\.production)?$" > /dev/null; then
    echo -e "${RED}❌ CRITICAL: .env files found in git!${NC}"
    echo "   Found:"
    git ls-files | grep -E "\.env(\.local|\.production)?$"
    echo "   Solution: Remove with 'git rm --cached .env*' and add to .gitignore"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files in git${NC}"
fi
echo ""

# Check 2: .gitignore includes .env
echo "📝 Checking .gitignore for .env patterns..."
if grep -q "\.env" .gitignore 2>/dev/null || grep -q "\.env" ../../.gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env patterns in .gitignore${NC}"
else
    echo -e "${RED}❌ CRITICAL: No .env pattern in .gitignore${NC}"
    echo "   Add '.env*' to .gitignore"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Check for hardcoded secrets in source code
echo "🔍 Scanning for hardcoded secrets in source code..."

# Check for potential API keys
if grep -r -E "(api[_-]?key|apikey|api_secret)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -v "process.env" | grep -v "// " | grep -v "/*" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  WARNING: Potential hardcoded API keys found${NC}"
    echo "   Review these matches:"
    grep -r -E "(api[_-]?key|apikey|api_secret)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -v "process.env" | grep -v "// " | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No obvious hardcoded API keys${NC}"
fi
echo ""

# Check 4: Verify NEXT_PUBLIC_ usage is appropriate
echo "🌐 Checking NEXT_PUBLIC_ variable usage..."

PUBLIC_VARS=$(grep -r "NEXT_PUBLIC_" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -v ".env" | wc -l)
echo "   Found ${PUBLIC_VARS} uses of NEXT_PUBLIC_ variables"

# Check if sensitive variables are marked as public
if grep -r "NEXT_PUBLIC_.*KEY" --include="*.ts" --include="*.tsx" src/ | grep -v "POOL_CONFIG_KEY" > /dev/null 2>&1; then
    echo -e "${RED}❌ CRITICAL: Sensitive *_KEY variable with NEXT_PUBLIC_ prefix!${NC}"
    grep -r "NEXT_PUBLIC_.*KEY" --include="*.ts" --include="*.tsx" src/ | grep -v "POOL_CONFIG_KEY"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No sensitive keys with NEXT_PUBLIC_ prefix${NC}"
fi
echo ""

# Check 5: Verify RPC_URL vs NEXT_PUBLIC_RPC_URL usage
echo "🌍 Checking RPC URL usage..."

# Check API routes use RPC_URL
API_RPC_USAGE=$(grep -r "process.env.RPC_URL" src/pages/api/ 2>/dev/null | wc -l)
if [ "$API_RPC_USAGE" -gt 0 ]; then
    echo -e "${GREEN}✅ API routes using RPC_URL (server-side)${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: API routes may not be using server-side RPC_URL${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check frontend uses NEXT_PUBLIC_RPC_URL or getRpcUrl()
FRONTEND_PUBLIC_RPC=$(grep -r "NEXT_PUBLIC_RPC_URL\|getRpcUrl" --include="*.tsx" --include="*.ts" src/ | grep -v "src/pages/api" | wc -l)
if [ "$FRONTEND_PUBLIC_RPC" -gt 0 ]; then
    echo -e "${GREEN}✅ Frontend using public RPC or getRpcUrl()${NC}"
else
    echo -e "${YELLOW}⚠️  INFO: Limited RPC usage in frontend (may be okay)${NC}"
fi
echo ""

# Check 6: Verify build works
echo "🏗️  Testing build process..."
if pnpm build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ CRITICAL: Build failed!${NC}"
    echo "   Check /tmp/build-test.log for details"
    tail -20 /tmp/build-test.log
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 7: Environment variable documentation
echo "📄 Checking environment documentation..."
if [ -f ".env.production.template" ]; then
    echo -e "${GREEN}✅ .env.production.template exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: No .env.production.template for reference${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 8: Verify no AWS credentials in code
echo "☁️  Checking for hardcoded AWS/R2 credentials..."
if grep -r -E "(AKIA|r2_access_key|r2_secret)" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep -v "process.env" > /dev/null 2>&1; then
    echo -e "${RED}❌ CRITICAL: Potential hardcoded AWS/R2 credentials!${NC}"
    grep -r -E "(AKIA|r2_access_key|r2_secret)" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep -v "process.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded AWS/R2 credentials${NC}"
fi
echo ""

# Check 9: Verify Arweave wallet key not hardcoded
echo "💾 Checking for hardcoded Arweave wallet..."
if grep -r '"kty":"RSA"' --include="*.ts" --include="*.tsx" --include="*.js" src/ > /dev/null 2>&1; then
    echo -e "${RED}❌ CRITICAL: Arweave wallet key may be hardcoded!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hardcoded Arweave wallet${NC}"
fi
echo ""

# Final Report
echo "=================================="
echo "📊 Security Verification Complete"
echo "=================================="
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ FAILED: ${ERRORS} critical error(s) found${NC}"
    echo "   ⚠️  DO NOT DEPLOY until these are fixed!"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED with warnings: ${WARNINGS} warning(s)${NC}"
    echo "   Review warnings before deploying"
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ PASSED: No security issues detected${NC}"
    echo "   Ready for deployment!"
    echo ""
    exit 0
fi
