# Cloudflare Pages Deployment Guide

## Quick Deploy Steps

### 1. Build Configuration
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `scaffolds/fun-launch`
- **Node.js version**: `20.x`

### 2. Environment Variables (Set in Cloudflare Pages Dashboard)

Required variables:
```
ARWEAVE_WALLET_KEY=your_arweave_wallet_key_here
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_POOL_CONFIG_KEY=your_pool_config_key_here
NODE_ENV=production
```

### 3. Cloudflare Pages Settings

#### Build Settings:
- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `scaffolds/fun-launch`

#### Functions:
- **Compatibility date**: 2023-05-18
- **Node.js version**: 20.x

### 4. Important Notes

#### Arweave Integration:
- The Arweave wallet key must be set as an environment variable
- API routes will work as Cloudflare Functions
- Large file uploads (images) should work fine through Arweave

#### API Routes:
- `/api/upload-arweave` - Handles image and metadata upload to Arweave
- `/api/send-transaction` - Handles Solana transaction submission

### 5. Deployment Steps

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect your GitHub repository

2. **Configure Build**:
   - Set build command: `npm run build`
   - Set output directory: `.next`
   - Set root directory: `scaffolds/fun-launch`

3. **Set Environment Variables**:
   - Add all required environment variables
   - Make sure ARWEAVE_WALLET_KEY is properly formatted (JSON string)

4. **Deploy**:
   - Cloudflare will automatically build and deploy
   - Monitor build logs for any issues

### 6. Post-Deployment Testing

Test these features:
- [ ] Page loads correctly
- [ ] Wallet connection works
- [ ] Form submission works
- [ ] Image upload to Arweave works
- [ ] Pool creation completes successfully
- [ ] Arweave URLs are accessible

### 7. Common Issues & Solutions

#### Build Issues:
- If build fails, check Node.js version (should be 20.x)
- Ensure all dependencies are in package.json

#### API Issues:
- Verify environment variables are set correctly
- Check function logs in Cloudflare dashboard
- Ensure ARWEAVE_WALLET_KEY is valid JSON

#### Performance:
- Static assets are automatically cached by Cloudflare CDN
- API routes run as edge functions for fast response times
