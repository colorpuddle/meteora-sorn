# 🚀 Cloudflare Pages Deployment Guide

Complete guide to deploying your Meteora pool creation application to Cloudflare Pages with proper security.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Security Overview](#security-overview)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Cloudflare Pages Configuration](#cloudflare-pages-configuration)
5. [Build Configuration](#build-configuration)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## 🔐 Prerequisites

### Required Services & Accounts

- ✅ **Cloudflare Account** with Pages enabled
- ✅ **GitHub Repository** (or GitLab/Bitbucket)
- ✅ **Paid RPC Provider** (Helius, QuickNode, Alchemy, or similar)
- ✅ **Arweave Wallet** with AR tokens for uploads
- ✅ **Cloudflare R2 Bucket** with encrypted keypairs uploaded
- ✅ **R2 API Tokens** with read access to your keypair bucket

### Local Setup Complete

- ✅ Application tested and working locally
- ✅ All encrypted keypairs uploaded to R2
- ✅ `.env.local` working with correct credentials
- ✅ `.gitignore` excluding all `.env*` files

---

## 🔒 Security Overview

### Public vs Private Variables

**NEXT_PUBLIC_* Variables (Exposed to Client)**
These are embedded in the frontend JavaScript bundle and visible to anyone:
- ✅ `NEXT_PUBLIC_NETWORK` - Network name (mainnet-beta/devnet)
- ✅ `NEXT_PUBLIC_EXPLORER_URL` - Solana Explorer URL
- ✅ `NEXT_PUBLIC_POOL_CONFIG_KEY` - Pool configuration public key
- ✅ `NEXT_PUBLIC_RPC_URL` - **Public RPC endpoint** (can be rate-limited)
- ✅ `NEXT_PUBLIC_UPLOAD_WORKER_URL` - Cloudflare Worker URL (optional)

**Private Variables (Server-Side Only)**
These are ONLY available in API routes and NEVER exposed to clients:
- 🔒 `RPC_URL` - **Premium/paid RPC endpoint** with API key
- 🔒 `ARWEAVE_WALLET_KEY` - Arweave wallet private key (JWK)
- 🔒 `R2_ACCESS_KEY_ID` - Cloudflare R2 access key
- 🔒 `R2_SECRET_ACCESS_KEY` - Cloudflare R2 secret key
- 🔒 `R2_ACCOUNT_ID` - Cloudflare account ID
- 🔒 `R2_BUCKET` - R2 bucket name
- 🔒 `MASTER_KEY` - Encryption key for R2 keypairs
- 🔒 `MARKETPLACE_WALLET` - Marketplace wallet address
- 🔒 `POOL_CONFIG_KEY` - Pool config key (fallback)

### RPC URL Strategy

**Two-Tier RPC Setup for Cost Optimization:**

1. **Frontend (NEXT_PUBLIC_RPC_URL)**
   - Uses FREE public Solana RPC
   - Rate-limited but sufficient for:
     - Fetching pool data
     - Getting account info
     - Querying blockchain state
   - Users can also connect their wallets which use their own RPC

2. **Backend (RPC_URL)**
   - Uses PAID premium RPC (Helius/QuickNode)
   - Higher rate limits for:
     - Creating pool transactions
     - Sending transactions
     - Time-sensitive operations
   - Protected from public abuse
   - API key never exposed to clients

**Recommended RPC Providers:**
- **Helius** - https://www.helius.dev/ (Generous free tier, excellent for mainnet)
- **QuickNode** - https://www.quicknode.com/ (Enterprise-grade, very reliable)
- **Alchemy** - https://www.alchemy.com/ (Multi-chain support)
- **Triton** - https://triton.one/ (Solana-specific)

---

## 🔑 Environment Variables Setup

### Step 1: Get Your RPC Endpoints

**For Production (Mainnet):**

1. **Sign up for paid RPC provider** (e.g., Helius):
   ```
   1. Go to https://www.helius.dev/
   2. Create account and project
   3. Copy your API endpoint
   4. Example: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```

2. **Set up two RPC URLs**:
   - `NEXT_PUBLIC_RPC_URL`: `https://api.mainnet-beta.solana.com` (public, free)
   - `RPC_URL`: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` (private, paid)

### Step 2: Get R2 API Tokens

1. Go to **Cloudflare Dashboard** → **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure token:
   - **Token Name**: `meteora-pool-app-production`
   - **Permissions**: `Object Read & Write`
   - **Specify bucket**: Select your `meteora-srn-keypairs-v2` bucket
   - **TTL**: No expiration (or set according to your security policy)
4. Copy credentials (save immediately - shown only once):
   ```
   Access Key ID: abc123...
   Secret Access Key: xyz789...
   Account ID: 662026c8d0e00c0751140d9a26175f6b
   ```

### Step 3: Prepare Environment Variables

Use the `.env.production.template` file as reference and prepare these values:

**Public Variables:**
```bash
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_EXPLORER_URL=https://explorer.solana.com
NEXT_PUBLIC_POOL_CONFIG_KEY=YOUR_MAINNET_POOL_CONFIG_KEY
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
```

**Private Variables:**
```bash
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
POOL_CONFIG_KEY=YOUR_MAINNET_POOL_CONFIG_KEY
MARKETPLACE_WALLET=YOUR_MARKETPLACE_WALLET_ADDRESS
ARWEAVE_WALLET_KEY={"d":"...","dp":"...","dq":"...","e":"AQAB",...}
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET=meteora-srn-keypairs-v2
MASTER_KEY=9673428b6ce7533256c9373c300c8a6f62d9d2b69d8667e2896e28ad6d74bdec
```

---

## ⚙️ Cloudflare Pages Configuration

### Step 1: Connect Repository to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **Pages**

2. **Create New Project**
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select your Git provider (GitHub/GitLab)
   - Authorize Cloudflare access
   - Select your repository

3. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: pnpm build
   Build output directory: .next
   Root directory: /scaffolds/fun-launch
   ```

   **Important**: If your app is in a subdirectory, set the root directory correctly.

### Step 2: Add Environment Variables

In Cloudflare Pages project settings:

1. Go to **Settings** → **Environment variables**

2. **Add Production Variables** (one by one):

   **Public Variables** (Select: Production):
   ```
   Variable name: NEXT_PUBLIC_NETWORK
   Value: mainnet-beta
   
   Variable name: NEXT_PUBLIC_EXPLORER_URL
   Value: https://explorer.solana.com
   
   Variable name: NEXT_PUBLIC_POOL_CONFIG_KEY
   Value: YOUR_MAINNET_POOL_CONFIG_KEY
   
   Variable name: NEXT_PUBLIC_RPC_URL
   Value: https://api.mainnet-beta.solana.com
   ```

   **Private Variables** (Select: Production, check "Encrypt"):
   ```
   Variable name: RPC_URL
   Value: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   [✓] Encrypt
   
   Variable name: ARWEAVE_WALLET_KEY
   Value: {"d":"...","dp":"...","dq":"...","e":"AQAB",...}
   [✓] Encrypt
   
   Variable name: R2_ACCESS_KEY_ID
   Value: your_r2_access_key_id
   [✓] Encrypt
   
   Variable name: R2_SECRET_ACCESS_KEY
   Value: your_r2_secret_access_key
   [✓] Encrypt
   
   Variable name: R2_ACCOUNT_ID
   Value: your_cloudflare_account_id
   [✓] Encrypt
   
   Variable name: R2_BUCKET
   Value: meteora-srn-keypairs-v2
   [✓] Encrypt
   
   Variable name: MASTER_KEY
   Value: 9673428b6ce7533256c9373c300c8a6f62d9d2b69d8667e2896e28ad6d74bdec
   [✓] Encrypt
   
   Variable name: MARKETPLACE_WALLET
   Value: YOUR_MARKETPLACE_WALLET_ADDRESS
   [✓] Encrypt
   
   Variable name: POOL_CONFIG_KEY
   Value: YOUR_MAINNET_POOL_CONFIG_KEY
   [✓] Encrypt
   ```

3. **Add Preview/Development Variables** (Optional):
   - Repeat for Preview environment using devnet values if needed
   - Or leave blank to only deploy to production

### Step 3: Configure Build Settings

In **Settings** → **Builds & deployments**:

**Build settings:**
```
Build command: pnpm install && pnpm build
Build output directory: .next
Root directory: /scaffolds/fun-launch (if applicable)
Node version: 18 or 20
```

**Build caching:**
- ✅ Enable build cache for faster builds

**Build watch paths:**
- Leave default (watches all files in root directory)

**Environment variables:**
- ✅ Verify all variables are set correctly

---

## 🏗️ Build Configuration

### Next.js Configuration

Ensure your `next.config.js` is compatible with Cloudflare Pages:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Cloudflare Pages uses Node.js runtime
  // No special experimental features needed
  
  // Ensure static assets are properly handled
  images: {
    unoptimized: true, // Cloudflare Pages doesn't support Next.js Image Optimization
  },
  
  // Environment variable configuration
  env: {
    // Public variables are automatically included
    // Private variables are only available server-side
  },
  
  // Output configuration
  output: 'standalone', // Optional: for smaller deployments
};

module.exports = nextConfig;
```

### Package.json Scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🚀 Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. **Cloudflare automatically builds**:
   - Watch build logs in Cloudflare Dashboard
   - Build typically takes 3-5 minutes
   - Check for any errors

3. **Deployment completes**:
   - Cloudflare assigns a URL: `https://your-project.pages.dev`
   - Can also add custom domain

### Option 2: Manual Deployment

1. **Build locally**:
   ```bash
   cd scaffolds/fun-launch
   pnpm install
   pnpm build
   ```

2. **Deploy via Wrangler CLI**:
   ```bash
   npx wrangler pages deploy .next --project-name=your-project
   ```

### Add Custom Domain (Optional)

1. Go to **Custom domains** in Cloudflare Pages project
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `pools.yourdomain.com`)
4. Cloudflare automatically configures DNS and SSL

---

## ✅ Post-Deployment Verification

### 1. Test Public Pages

Visit your deployed URL and verify:

- ✅ Homepage loads correctly
- ✅ Pool creation form renders
- ✅ No console errors in browser DevTools
- ✅ Network request shows correct API URL

### 2. Test API Routes

**Test RPC Configuration:**
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

### 3. Test Pool Creation Flow

1. **Create DBC Config**:
   - Fill out pool creation form
   - Submit and verify config creation
   - Check transaction on Solana Explorer

2. **Upload to Arweave**:
   - Upload token image
   - Verify Arweave transaction
   - Confirm image is accessible

3. **Fetch R2 Keypair**:
   - Check server logs for keypair fetch
   - Verify decryption success
   - Confirm keypair usage tracking

4. **Complete Pool Creation**:
   - Submit final pool creation
   - Verify transaction success
   - Check pool appears on Meteora

### 4. Verify Environment Variables

**Check that secrets are NOT exposed:**

1. **View page source** in browser
2. **Search for sensitive strings**:
   - Search for: `R2_ACCESS_KEY` → Should NOT appear
   - Search for: `MASTER_KEY` → Should NOT appear
   - Search for: `ARWEAVE_WALLET_KEY` → Should NOT appear
   - Search for: `api-key` (from paid RPC) → Should NOT appear

3. **Check Network tab**:
   - Open browser DevTools → Network
   - Refresh page
   - Look at `.js` bundles
   - Verify no secrets in source code

**Secrets should ONLY appear in API responses (server-side), never in client bundles!**

### 5. Monitor Build Logs

Watch for any warnings in Cloudflare build logs:

```bash
# In Cloudflare Dashboard → Deployments → [Latest Build] → Logs
```

Look for:
- ✅ `Build completed successfully`
- ✅ No missing environment variable warnings
- ✅ No Node.js compatibility errors

---

## 🐛 Troubleshooting

### Build Failures

**Error: `Module not found` or `Cannot find package`**
```bash
# Solution: Ensure all dependencies are in package.json
pnpm install
pnpm build  # Test locally first
```

**Error: `Out of memory` during build**
```bash
# Solution: Add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

### Environment Variable Issues

**Error: `Environment variable X is undefined`**

1. Check variable is set in Cloudflare Dashboard
2. Verify spelling matches exactly (case-sensitive)
3. For public variables, ensure `NEXT_PUBLIC_` prefix
4. Redeploy after adding variables

**Error: `RPC URL not working`**

1. Verify RPC endpoint is correct
2. Check API key is valid
3. Test RPC endpoint with curl:
   ```bash
   curl -X POST YOUR_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

### R2 Keypair Issues

**Error: `Failed to decrypt keypair`**

1. Verify `MASTER_KEY` matches encryption key
2. Check R2 credentials are correct
3. Confirm R2 bucket name matches
4. Test R2 access with Wrangler CLI:
   ```bash
   npx wrangler r2 object list YOUR_BUCKET --limit 5
   ```

**Error: `No available keypairs`**

1. Verify keypairs are uploaded to R2
2. Check bucket name is correct
3. Confirm keypair prefix matches (`srn_keypair_*`)

### Arweave Upload Issues

**Error: `Failed to upload to Arweave`**

1. Verify `ARWEAVE_WALLET_KEY` is valid JSON
2. Check wallet has sufficient AR balance
3. Test Arweave network connectivity
4. Try alternative Arweave gateway:
   ```bash
   # In next.config.js or API route
   const arweave = Arweave.init({
     host: 'arweave.net',
     port: 443,
     protocol: 'https',
     timeout: 60000,  // Increase timeout
   });
   ```

### Cloudflare Pages Specific

**Error: `Function size exceeds limit`**

```bash
# Solution: Enable code splitting in next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
    };
    return config;
  },
};
```

**Error: `Request timeout` on API routes**

```bash
# Solution: Cloudflare Pages Functions have 10s timeout (Workers have 30s)
# Optimize slow operations or use Cloudflare Workers instead
```

---

## 🔐 Security Best Practices

### Pre-Deployment Checklist

- ✅ All `.env*` files in `.gitignore`
- ✅ No secrets committed to git (check git history)
- ✅ `NEXT_PUBLIC_RPC_URL` uses free public endpoint
- ✅ `RPC_URL` uses paid private endpoint
- ✅ All sensitive variables encrypted in Cloudflare dashboard
- ✅ R2 API token has minimum required permissions
- ✅ Arweave wallet has sufficient but not excessive AR balance
- ✅ Test deployment on preview environment first

### Post-Deployment Monitoring

- 📊 Monitor RPC usage/costs in provider dashboard
- 📊 Monitor R2 bandwidth usage in Cloudflare dashboard
- 📊 Track Arweave wallet balance
- 📊 Review Cloudflare Analytics for traffic patterns
- 🔍 Check for any exposed secrets in client bundle (quarterly audit)

### Incident Response

**If secrets are accidentally exposed:**

1. **Immediately rotate all affected credentials**:
   - Generate new R2 API tokens
   - Update Arweave wallet key
   - Change MASTER_KEY (requires re-encrypting all keypairs)
   - Update RPC API keys

2. **Update environment variables** in Cloudflare Dashboard

3. **Redeploy application** with new secrets

4. **Review git history** for committed secrets:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env*" \
     --prune-empty --tag-name-filter cat -- --all
   ```

---

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Helius RPC Documentation](https://docs.helius.dev/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Arweave Documentation](https://docs.arweave.org/)

---

## 🎉 Deployment Complete!

Your application is now live on Cloudflare Pages with:

- ✅ Secure environment variables (secrets protected)
- ✅ Two-tier RPC setup (cost-optimized)
- ✅ R2 keypair integration (scalable)
- ✅ Arweave uploads (permanent storage)
- ✅ SSL/HTTPS enabled (automatic)
- ✅ CDN acceleration (global)
- ✅ Automatic deployments (git-based)

**Next Steps:**
1. Test pool creation end-to-end
2. Monitor costs and usage
3. Set up custom domain (optional)
4. Configure analytics (optional)
5. Plan for scaling if needed

For questions or issues, refer to the troubleshooting section above or check Cloudflare's support documentation.
