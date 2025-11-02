# 🚀 Cloudflare Pages Deployment - Quick Start

## Step 1: Prepare Your RPC Endpoints

### Get a Premium RPC (Required for Production)

**Option 1: Helius (Recommended)**
1. Go to: https://www.helius.dev/
2. Sign up (free tier available)
3. Create a new project
4. Copy your mainnet RPC URL
5. Example: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`

**Option 2: QuickNode**
1. Go to: https://www.quicknode.com/
2. Sign up for an account
3. Create a Solana Mainnet endpoint
4. Copy your HTTP Provider URL

---

## Step 2: Deploy to Cloudflare Pages

### A. Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Login to your account
   - Navigate to: **Workers & Pages** → **Pages**

2. **Create New Project**
   - Click **Create application**
   - Select **Pages**
   - Click **Connect to Git**

3. **Connect Your Repository**
   - Select **GitHub** (or your Git provider)
   - Authorize Cloudflare access
   - Select repository: `meteora-sorn`
   - Click **Begin setup**

4. **Configure Build Settings**
   ```
   Project name: meteora-pool-creator (or your choice)
   Production branch: main
   Framework preset: Next.js
   Build command: pnpm build
   Build output directory: .next
   Root directory: /scaffolds/fun-launch
   ```

5. **Click "Save and Deploy"** (Don't worry, it will fail without env vars - we'll add them next)

---

## Step 3: Add Environment Variables

After the initial deployment (even if it fails), go to:
**Settings** → **Environment variables** → **Add variable**

### Public Variables (NOT encrypted)

Add these one by one:

```bash
Variable: NEXT_PUBLIC_NETWORK
Value: mainnet-beta
Environment: Production
[Save]

Variable: NEXT_PUBLIC_EXPLORER_URL
Value: https://explorer.solana.com
Environment: Production
[Save]

Variable: NEXT_PUBLIC_POOL_CONFIG_KEY
Value: F1zKU8qhvxvcmmbJZJNjnTY8FV8tziZ4Vhn4Eg53Sm2y
Environment: Production
[Save]

Variable: NEXT_PUBLIC_RPC_URL
Value: https://api.mainnet-beta.solana.com
Environment: Production
[Save]
```

### Private Variables (✓ CHECK "Encrypt" for each)

```bash
Variable: RPC_URL
Value: https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
Environment: Production
[✓] Encrypt
[Save]

Variable: ARWEAVE_WALLET_KEY
Value: (paste your entire Arweave wallet JWK from .env.local)
Environment: Production
[✓] Encrypt
[Save]

Variable: R2_ACCESS_KEY_ID
Value: (from your .env.local)
Environment: Production
[✓] Encrypt
[Save]

Variable: R2_SECRET_ACCESS_KEY
Value: (from your .env.local)
Environment: Production
[✓] Encrypt
[Save]

Variable: R2_ACCOUNT_ID
Value: (from your .env.local)
Environment: Production
[✓] Encrypt
[Save]

Variable: R2_BUCKET
Value: meteora-srn-keypairs-v2
Environment: Production
[✓] Encrypt
[Save]

Variable: MASTER_KEY
Value: 9673428b6ce7533256c9373c300c8a6f62d9d2b69d8667e2896e28ad6d74bdec
Environment: Production
[✓] Encrypt
[Save]

Variable: MARKETPLACE_WALLET
Value: GL8S9FJ439BffGV7ZnifrFzoxzJBm9YpbHdgrXk2zDgJ
Environment: Production
[✓] Encrypt
[Save]

Variable: POOL_CONFIG_KEY
Value: F1zKU8qhvxvcmmbJZJNjnTY8FV8tziZ4Vhn4Eg53Sm2y
Environment: Production
[✓] Encrypt
[Save]
```

---

## Step 4: Retry Deployment

1. After adding all environment variables
2. Go to **Deployments** tab
3. Click **Retry deployment** on the latest deployment
4. Or push a new commit to trigger automatic deployment

---

## Step 5: Verify Deployment

Once deployment succeeds:

1. **Visit your URL**
   - Example: `https://meteora-pool-creator.pages.dev`

2. **Test the application**
   - Homepage loads ✓
   - No console errors ✓
   - Try creating a pool ✓

3. **Verify secrets are NOT exposed**
   - Press F12 → View Page Source
   - Search for: `R2_ACCESS_KEY` → Should NOT appear ✓
   - Search for: `MASTER_KEY` → Should NOT appear ✓

4. **Test API endpoint**
   ```bash
   curl https://your-project.pages.dev/api/test-rpc
   ```

---

## Alternative: Deploy via Wrangler CLI

If you prefer command line:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
cd /home/rapu_ll/Sigma-mainnet-27+06/meteora/meteora-invent/scaffolds/fun-launch
pnpm build

# Deploy
npx wrangler pages deploy .next --project-name=meteora-pool-creator

# Then add environment variables in the dashboard
```

---

## 🎉 Next Steps After Deployment

1. **Test pool creation** on mainnet
2. **Add custom domain** (optional)
3. **Monitor costs** in Cloudflare dashboard
4. **Set up analytics** (optional)

---

## 📞 Need Help?

- Check build logs in Cloudflare Dashboard
- Review `CLOUDFLARE-DEPLOYMENT-GUIDE.md` for detailed troubleshooting
- Test locally first: `pnpm build && pnpm start`

---

**Ready?** Let's go! 🚀
