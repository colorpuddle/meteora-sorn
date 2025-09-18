# 🔐 Secure Deployment Guide (No Wrangler)

## Overview
This guide shows how to deploy securely using GitHub Actions with encrypted secrets, avoiding the security risks of storing private keys in Cloudflare environment variables.

## 🚀 Quick Start

### Step 1: Generate Dedicated Upload Wallet
```bash
cd scaffolds/fun-launch
node scripts/generate-upload-wallet.js
```

This creates a wallet specifically for uploads with minimal security exposure.

### Step 2: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
```
ARWEAVE_UPLOAD_WALLET_KEY=[generated_wallet_key_json]
RPC_URL=https://api.devnet.solana.com
POOL_CONFIG_KEY=6hhdBg7hWQR7yEJmfpsGsZ4thfDEgHhteXzgSe8msXsn
CLOUDFLARE_API_TOKEN=[get_from_cloudflare_dashboard]
CLOUDFLARE_ACCOUNT_ID=[get_from_cloudflare_dashboard]
```

### Step 3: Get Cloudflare Credentials

1. **API Token**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create Token → Custom token
   - Permissions: Zone:Read, Page:Edit
   - Zone Resources: Include All zones

2. **Account ID**:
   - Go to Cloudflare Dashboard → Right sidebar
   - Copy Account ID

### Step 4: Fund Upload Wallet

Send **only 0.1-0.5 AR** to the generated wallet address:
- Testnet: Use https://faucet.arweave.net/
- Mainnet: Buy minimal AR and send to wallet

### Step 5: Deploy

Push to main branch - GitHub Actions will automatically:
1. ✅ Build the application securely
2. ✅ Deploy to Cloudflare Pages
3. ✅ Keep keys encrypted and secure

## 🛡️ Security Benefits

### ✅ What's Secure:
- Private keys stored as encrypted GitHub secrets
- No keys in Cloudflare environment variables
- Minimal funding in upload wallet (0.1-0.5 AR max)
- Dedicated wallet for uploads only
- Keys only decrypted during build process
- Automatic deployment without manual key handling

### ❌ What We Avoid:
- Storing keys in Cloudflare dashboard
- Using main Arweave wallet for uploads
- Manual deployment with key exposure
- Wrangler configuration files with secrets

## 🔄 Key Rotation

To rotate the upload wallet:

1. Generate new wallet: `node scripts/generate-upload-wallet.js`
2. Update GitHub secret: `ARWEAVE_UPLOAD_WALLET_KEY`
3. Fund new wallet with minimal AR
4. Deploy automatically updates

## 📊 Monitoring

- Monitor GitHub Actions runs for deployment status
- Check Cloudflare Pages dashboard for live site
- Monitor Arweave wallet balance (should stay low)
- Track upload costs and usage

## 🆘 Emergency Procedures

**If upload wallet is compromised:**
1. Generate new wallet immediately
2. Update GitHub secret
3. Deploy to activate new wallet
4. Monitor for unauthorized usage

**If GitHub secrets are compromised:**
1. Rotate all secrets immediately
2. Generate new Cloudflare API token
3. Generate new upload wallet
4. Update all secrets and redeploy

## ✅ Deployment Checklist

- [ ] Generated dedicated upload wallet
- [ ] Set up GitHub secrets (5 required)
- [ ] Got Cloudflare API token and Account ID
- [ ] Funded upload wallet with minimal AR
- [ ] Tested GitHub Actions workflow
- [ ] Verified deployment works
- [ ] Confirmed Arweave uploads function
- [ ] Set up monitoring for wallet balance

## 🎯 Next Steps

1. **Run**: `node scripts/generate-upload-wallet.js`
2. **Set up**: GitHub secrets with the generated key
3. **Get**: Cloudflare credentials
4. **Fund**: Upload wallet with minimal AR
5. **Push**: Code to trigger deployment
6. **Test**: Complete application functionality

🔐 **This approach provides enterprise-level security while maintaining simplicity!**
