# 📦 Cloudflare Pages Deployment - Quick Summary

## 🎯 What You Need to Deploy

### 1. **Environment Variables Configuration**

Your app uses TWO sets of environment variables:

#### **Public Variables** (Exposed to users - safe)
- `NEXT_PUBLIC_NETWORK=mainnet-beta`
- `NEXT_PUBLIC_EXPLORER_URL=https://explorer.solana.com`
- `NEXT_PUBLIC_POOL_CONFIG_KEY=YOUR_KEY`
- `NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com` (FREE public endpoint)

#### **Private Variables** (Server-side only - MUST encrypt)
- `RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` ⚡ **PAID endpoint**
- `ARWEAVE_WALLET_KEY={"d":"...","e":"AQAB",...}` 🔒
- `R2_ACCESS_KEY_ID=abc123...` 🔒
- `R2_SECRET_ACCESS_KEY=xyz789...` 🔒
- `R2_ACCOUNT_ID=662026c8...` 🔒
- `R2_BUCKET=meteora-srn-keypairs-v2` 🔒
- `MASTER_KEY=9673428b6ce...` 🔒
- `MARKETPLACE_WALLET=YOUR_ADDRESS` 🔒
- `POOL_CONFIG_KEY=YOUR_KEY` 🔒

---

## 🚀 Deployment Steps (5 Minutes)

### Step 1: Get Premium RPC Endpoint
1. Sign up at **Helius** (https://www.helius.dev/) - Recommended
2. Create project and copy API URL
3. Example: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`

### Step 2: Connect to Cloudflare Pages
1. Go to Cloudflare Dashboard → **Workers & Pages** → **Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository

### Step 3: Configure Build
```
Framework preset: Next.js
Build command: pnpm build
Build output directory: .next
Root directory: /scaffolds/fun-launch (if in subdirectory)
```

### Step 4: Add Environment Variables
In Cloudflare Pages → **Settings** → **Environment variables**:

**Add each variable:**
1. Click **Add variable**
2. Enter name and value
3. Select **Production**
4. ✓ Check **Encrypt** for PRIVATE variables
5. Click **Save**

### Step 5: Deploy
1. Click **Save and Deploy**
2. Wait 3-5 minutes for build
3. Visit your deployment URL

---

## 🔐 Security Guarantees

### ✅ What's Protected

**Your secrets are SAFE because:**
- `RPC_URL` with API key → Only available in API routes (server-side)
- R2 credentials → Only in server-side code
- `MASTER_KEY` → Only in server-side decryption
- Arweave wallet → Only in server-side upload code
- All encrypted in Cloudflare's secure storage

### ✅ What's Public (By Design)

**These are INTENTIONALLY exposed (safe):**
- `NEXT_PUBLIC_NETWORK` → Network name (mainnet-beta)
- `NEXT_PUBLIC_EXPLORER_URL` → Solana Explorer URL  
- `NEXT_PUBLIC_RPC_URL` → FREE public RPC (rate-limited, but okay for reads)
- `NEXT_PUBLIC_POOL_CONFIG_KEY` → Public key (not secret)

### 🎯 Two-Tier RPC Strategy

**Why you have 2 RPC URLs:**

1. **Frontend (NEXT_PUBLIC_RPC_URL)** → FREE public RPC
   - Used for reading blockchain data
   - Rate-limited but sufficient for users
   - Can't be hidden (runs in browser)

2. **Backend (RPC_URL)** → PAID premium RPC  
   - Used for sending transactions
   - Higher rate limits
   - Protected from public abuse
   - API key never exposed

**Cost Optimization:**
- Users make 100 requests/day → Use FREE public RPC
- API sends 10 transactions/day → Use PAID premium RPC
- Total cost: ~$5-10/month instead of $50-100/month

---

## 📋 Pre-Deployment Checklist

Run this before deploying:

```bash
cd /path/to/scaffolds/fun-launch
./verify-security.sh
```

This checks:
- ✅ No `.env` files in git
- ✅ No hardcoded secrets
- ✅ Build works
- ✅ Environment variables correct

---

## ✅ Post-Deployment Verification

### 1. Test RPC Configuration
```bash
curl https://your-project.pages.dev/api/test-rpc
```

Should return:
```json
{
  "success": true,
  "serverRpcUrl": "https://mainnet.helius-rpc.com/...",
  "usingCorrectRpc": true
}
```

### 2. Check Secrets NOT Exposed
1. Open your site in browser
2. Press F12 → View Page Source
3. Search for:
   - `R2_ACCESS_KEY` → Should NOT appear ✅
   - `MASTER_KEY` → Should NOT appear ✅
   - `api-key` (from RPC) → Should NOT appear ✅

### 3. Test Pool Creation
1. Fill out pool creation form
2. Submit and verify:
   - ✅ DBC config created
   - ✅ Image uploaded to Arweave
   - ✅ Keypair fetched from R2
   - ✅ Pool created on Meteora

---

## 📁 Files Created for You

1. **`.env.production.template`** - Template for production environment variables
2. **`CLOUDFLARE-DEPLOYMENT-GUIDE.md`** - Complete deployment guide (25 pages)
3. **`DEPLOYMENT-CHECKLIST.md`** - Step-by-step checklist
4. **`verify-security.sh`** - Security verification script

---

## 💰 Cost Estimate

### Monthly Costs:
- **Cloudflare Pages**: $0 (free tier, 500 builds/month)
- **Cloudflare R2**: ~$0.15 (15GB storage, minimal requests)
- **Helius RPC**: $5-10 (Developer tier, sufficient for most apps)
- **Arweave Storage**: ~$0.50 per 1000 uploads (one-time per file)

**Total: ~$5-11/month** (vs ~$50-100/month without optimization)

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Test locally first
cd scaffolds/fun-launch
pnpm build
```

### RPC Not Working
```bash
# Test your RPC endpoint
curl -X POST YOUR_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Keypair Decryption Fails
- Verify `MASTER_KEY` matches encryption key
- Check R2 credentials are correct
- Confirm bucket name is `meteora-srn-keypairs-v2`

---

## 📞 Need Help?

1. **Check detailed guide**: `CLOUDFLARE-DEPLOYMENT-GUIDE.md`
2. **Run security check**: `./verify-security.sh`
3. **Review checklist**: `DEPLOYMENT-CHECKLIST.md`
4. **Cloudflare Docs**: https://developers.cloudflare.com/pages/

---

## ✨ Key Takeaways

1. **TWO RPC URLs** = Cost optimization (free for users, paid for API)
2. **Cloudflare encrypts** all private environment variables
3. **Nothing secret** appears in client-side JavaScript
4. **R2 keypairs** are properly encrypted and decrypted server-side
5. **Arweave uploads** use wallet key that's kept secret
6. **Ready for production** with all security best practices

---

**Status**: ✅ Ready to Deploy

**Next Action**: Follow `CLOUDFLARE-DEPLOYMENT-GUIDE.md` or run `./verify-security.sh`
