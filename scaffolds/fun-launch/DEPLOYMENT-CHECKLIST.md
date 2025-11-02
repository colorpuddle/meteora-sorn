# ✅ Cloudflare Pages Deployment Checklist

Use this checklist before and after deploying to Cloudflare Pages.

## 📋 Pre-Deployment Checklist

### 1. Security Verification

- [ ] Run security verification script: `./verify-security.sh`
- [ ] All `.env*` files excluded from git
- [ ] No secrets committed to repository (check `git log -S "SECRET_KEYWORD"`)
- [ ] No hardcoded API keys in source code
- [ ] No hardcoded R2 credentials
- [ ] No hardcoded Arweave wallet key

### 2. Environment Variables Prepared

**Public Variables (NEXT_PUBLIC_*):**
- [ ] `NEXT_PUBLIC_NETWORK` - Set to `mainnet-beta`
- [ ] `NEXT_PUBLIC_EXPLORER_URL` - Set to `https://explorer.solana.com`
- [ ] `NEXT_PUBLIC_POOL_CONFIG_KEY` - Mainnet pool config key ready
- [ ] `NEXT_PUBLIC_RPC_URL` - Public free RPC endpoint ready

**Private Variables (Server-Side Only):**
- [ ] `RPC_URL` - Paid premium RPC endpoint ready (Helius/QuickNode)
- [ ] `ARWEAVE_WALLET_KEY` - Arweave wallet JWK ready
- [ ] `R2_ACCESS_KEY_ID` - Cloudflare R2 access key ready
- [ ] `R2_SECRET_ACCESS_KEY` - Cloudflare R2 secret key ready
- [ ] `R2_ACCOUNT_ID` - Cloudflare account ID ready
- [ ] `R2_BUCKET` - Set to `meteora-srn-keypairs-v2`
- [ ] `MASTER_KEY` - Encryption master key ready
- [ ] `MARKETPLACE_WALLET` - Marketplace wallet address ready
- [ ] `POOL_CONFIG_KEY` - Pool config key ready

### 3. RPC Endpoints Configured

- [ ] **Frontend RPC** (`NEXT_PUBLIC_RPC_URL`): Free public endpoint
- [ ] **Backend RPC** (`RPC_URL`): Paid premium endpoint with API key
- [ ] RPC endpoints tested and working
- [ ] API key has sufficient credits/balance

### 4. R2 Bucket Prepared

- [ ] R2 bucket `meteora-srn-keypairs-v2` created
- [ ] All 1,092 encrypted keypairs uploaded to R2
- [ ] R2 API tokens have correct permissions (Object Read & Write)
- [ ] R2 bucket region set appropriately
- [ ] Test keypair can be fetched and decrypted

### 5. Arweave Wallet Ready

- [ ] Arweave wallet has sufficient AR balance
- [ ] Arweave wallet key is valid JWK format
- [ ] Test upload to Arweave works
- [ ] Wallet address recorded for monitoring

### 6. Code Verification

- [ ] Application tested locally with production-like settings
- [ ] All features working:
  - [ ] DBC config creation
  - [ ] Image upload to Arweave
  - [ ] Metadata upload to Arweave
  - [ ] R2 keypair fetch and decryption
  - [ ] Pool creation transaction
- [ ] Build succeeds: `pnpm build`
- [ ] No TypeScript errors
- [ ] No ESLint errors

### 7. Git Repository

- [ ] All changes committed
- [ ] Repository pushed to GitHub/GitLab
- [ ] Branch set for deployment (usually `main`)
- [ ] Repository accessible by Cloudflare Pages

---

## 🚀 Deployment Steps

### 1. Create Cloudflare Pages Project

- [ ] Login to Cloudflare Dashboard
- [ ] Navigate to **Workers & Pages** → **Pages**
- [ ] Click **Create application** → **Pages** → **Connect to Git**
- [ ] Authorize Cloudflare access to your Git provider
- [ ] Select repository

### 2. Configure Build Settings

- [ ] **Framework preset**: `Next.js`
- [ ] **Build command**: `pnpm build` (or `npm run build`)
- [ ] **Build output directory**: `.next`
- [ ] **Root directory**: `/scaffolds/fun-launch` (if applicable)
- [ ] **Node version**: `18` or `20`

### 3. Add Environment Variables

**In Cloudflare Dashboard → Settings → Environment variables:**

For each variable:
- [ ] Add variable name
- [ ] Add variable value
- [ ] Select **Production** environment
- [ ] Check **Encrypt** for private variables
- [ ] Click **Save**

**Public Variables (NOT encrypted):**
- [ ] `NEXT_PUBLIC_NETWORK`
- [ ] `NEXT_PUBLIC_EXPLORER_URL`
- [ ] `NEXT_PUBLIC_POOL_CONFIG_KEY`
- [ ] `NEXT_PUBLIC_RPC_URL`

**Private Variables (ENCRYPTED):**
- [ ] `RPC_URL` ✓ Encrypt
- [ ] `ARWEAVE_WALLET_KEY` ✓ Encrypt
- [ ] `R2_ACCESS_KEY_ID` ✓ Encrypt
- [ ] `R2_SECRET_ACCESS_KEY` ✓ Encrypt
- [ ] `R2_ACCOUNT_ID` ✓ Encrypt
- [ ] `R2_BUCKET` ✓ Encrypt
- [ ] `MASTER_KEY` ✓ Encrypt
- [ ] `MARKETPLACE_WALLET` ✓ Encrypt
- [ ] `POOL_CONFIG_KEY` ✓ Encrypt

### 4. Deploy

- [ ] Click **Save and Deploy** or push to trigger deployment
- [ ] Monitor build logs for errors
- [ ] Wait for build to complete (typically 3-5 minutes)
- [ ] Note deployment URL

---

## ✅ Post-Deployment Verification

### 1. Basic Functionality

- [ ] Visit deployment URL
- [ ] Homepage loads without errors
- [ ] No console errors in browser DevTools
- [ ] Page renders correctly

### 2. API Routes Working

Test RPC configuration:
```bash
curl https://your-project.pages.dev/api/test-rpc
```

Expected response:
```json
{
  "success": true,
  "nextPublicRpcUrl": "https://api.mainnet-beta.solana.com",
  "serverRpcUrl": "https://mainnet.helius-rpc.com/...",
  "usingCorrectRpc": true
}
```

- [ ] API route responds
- [ ] Server RPC URL is premium endpoint
- [ ] Public RPC URL is free endpoint

### 3. Security Verification

**Check secrets are NOT exposed:**

- [ ] View page source in browser
- [ ] Search for `R2_ACCESS_KEY` → Should NOT appear ✓
- [ ] Search for `R2_SECRET_ACCESS_KEY` → Should NOT appear ✓
- [ ] Search for `MASTER_KEY` → Should NOT appear ✓
- [ ] Search for `ARWEAVE_WALLET_KEY` → Should NOT appear ✓
- [ ] Search for your RPC API key → Should NOT appear ✓

**Check Network tab:**
- [ ] Open browser DevTools → Network tab
- [ ] Refresh page
- [ ] Inspect JavaScript bundles
- [ ] Verify no secrets in source

### 4. Pool Creation Flow

**Test end-to-end:**

- [ ] Create DBC config
  - [ ] Form submits successfully
  - [ ] Transaction confirmed
  - [ ] Config keypair generated

- [ ] Upload image to Arweave
  - [ ] Image uploads successfully
  - [ ] Arweave URL returned
  - [ ] Image accessible at URL

- [ ] Upload metadata to Arweave
  - [ ] Metadata uploads successfully
  - [ ] Metadata URL returned
  - [ ] Metadata accessible at URL

- [ ] Fetch R2 keypair
  - [ ] Keypair fetched from R2
  - [ ] Decryption successful
  - [ ] Keypair marked as used

- [ ] Create pool
  - [ ] Pool transaction created
  - [ ] Transaction sent successfully
  - [ ] Pool appears on Meteora

### 5. Monitor Resources

**Check usage and costs:**

- [ ] RPC usage in provider dashboard
- [ ] Arweave wallet balance
- [ ] R2 bandwidth usage in Cloudflare dashboard
- [ ] Cloudflare Pages analytics

### 6. Error Monitoring

- [ ] Check Cloudflare Pages logs for errors
- [ ] Review server logs for failed requests
- [ ] Monitor Sentry/error tracking (if configured)

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

- [ ] Navigate to **Custom domains** in Cloudflare Pages
- [ ] Click **Set up a custom domain**
- [ ] Enter domain name
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate active

### Performance Optimization

- [ ] Enable Cloudflare Analytics
- [ ] Configure caching rules if needed
- [ ] Set up Web Analytics
- [ ] Monitor Core Web Vitals

### Monitoring & Alerts

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure RPC usage alerts
- [ ] Monitor Arweave wallet balance
- [ ] Set up error notifications

---

## 🚨 Rollback Plan

**If deployment has critical issues:**

### Immediate Actions

- [ ] Navigate to Cloudflare Pages project
- [ ] Go to **Deployments** tab
- [ ] Find last working deployment
- [ ] Click **...** → **Rollback to this deployment**
- [ ] Verify rollback successful

### Investigate Issues

- [ ] Check build logs for errors
- [ ] Review environment variables
- [ ] Test problematic features locally
- [ ] Check for breaking changes in dependencies

### Fix and Redeploy

- [ ] Fix issues in local environment
- [ ] Test thoroughly
- [ ] Commit fixes
- [ ] Push to trigger new deployment

---

## 📊 Success Criteria

Deployment is successful when:

- ✅ All pages load without errors
- ✅ API routes respond correctly
- ✅ No secrets exposed in client bundle
- ✅ Pool creation works end-to-end
- ✅ R2 keypairs can be fetched and decrypted
- ✅ Arweave uploads successful
- ✅ Transactions confirm on blockchain
- ✅ No critical errors in logs
- ✅ Performance acceptable (< 3s load time)
- ✅ SSL/HTTPS working
- ✅ Custom domain working (if configured)

---

## 📞 Support Resources

If you encounter issues:

1. **Check Documentation**:
   - [CLOUDFLARE-DEPLOYMENT-GUIDE.md](./CLOUDFLARE-DEPLOYMENT-GUIDE.md)
   - [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

2. **Review Logs**:
   - Cloudflare Pages build logs
   - Browser console errors
   - Server API logs

3. **Test Locally**:
   - Reproduce issue in local environment
   - Check environment variable configuration
   - Verify dependencies are up to date

4. **Community Support**:
   - Cloudflare Discord
   - Meteora Documentation
   - GitHub Issues

---

## 📝 Notes

- **Date of Deployment**: _____________
- **Deployed By**: _____________
- **Deployment URL**: _____________
- **Custom Domain**: _____________ (if applicable)
- **RPC Provider**: _____________
- **Version/Commit**: _____________

**Issues Encountered**:
- _____________________________________________
- _____________________________________________

**Resolution**:
- _____________________________________________
- _____________________________________________

---

**Deployment Status**: 🟢 Success / 🟡 Partial / 🔴 Failed

**Verified By**: _____________

**Date**: _____________
