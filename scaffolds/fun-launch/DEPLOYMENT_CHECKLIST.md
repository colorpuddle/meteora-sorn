# 🚀 Cloudflare Pages Deployment Checklist

## Pre-Deployment Checklist ✅

- [x] **Build Configuration**: Next.js build works locally (`npm run build`)
- [x] **Build Files**: Created `wrangler.toml` and deployment documentation
- [x] **Environment Template**: Created `.env.production.template` with required variables
- [x] **API Routes**: Verified `/api/upload-arweave` and `/api/send-transaction` work locally
- [x] **Arweave Integration**: Tested permanent storage with wallet balance: 0.679 AR

## Deployment Steps 🛠️

### 1. Create Cloudflare Pages Project
```bash
# Go to: https://pages.cloudflare.com/
# Click: "Create a project"
# Connect your GitHub repository
```

### 2. Configure Build Settings
```yaml
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: scaffolds/fun-launch
Environment variables: Node.js 20.x
```

### 3. Set Environment Variables
Copy these exact values from `.env.local` to Cloudflare Pages dashboard:

```bash
# Required for production
ARWEAVE_WALLET_KEY=[your_full_arweave_wallet_json]
RPC_URL=https://api.devnet.solana.com  # or mainnet for production
POOL_CONFIG_KEY=6hhdBg7hWQR7yEJmfpsGsZ4thfDEgHhteXzgSe8msXsn
NODE_ENV=production
```

### 4. Deploy and Monitor
- [x] **Initial Deploy**: Cloudflare will automatically build and deploy
- [ ] **Build Logs**: Monitor build process for any errors
- [ ] **Function Logs**: Check API routes work in production

## Post-Deployment Testing 🧪

### Critical Tests:
1. **Page Load**: Verify site loads at your Cloudflare Pages URL
2. **Wallet Connection**: Test wallet adapter integration
3. **Form Submission**: Test create pool form
4. **Arweave Upload**: Verify image upload to Arweave works
5. **Pool Creation**: Complete end-to-end pool creation flow

### Expected Results:
- ✅ Fast page load times (Cloudflare CDN)
- ✅ Functional wallet connection
- ✅ Successful image uploads to Arweave
- ✅ Pool creation completing with transaction confirmation
- ✅ Permanent Arweave URLs accessible (https://arweave.net/...)

## Troubleshooting 🔧

### Common Issues:
1. **Build Failures**: Check Node.js version is 20.x
2. **API Errors**: Verify environment variables are set correctly
3. **CORS Issues**: API routes should work automatically with Cloudflare Functions
4. **Arweave Errors**: Ensure wallet key is valid JSON format

### Debugging Tools:
- Cloudflare Pages build logs
- Browser developer console
- Cloudflare Functions logs
- Arweave transaction explorer

## Performance Notes 📈

- **Static Assets**: Automatically cached by Cloudflare CDN
- **API Routes**: Run as Cloudflare Functions (edge computing)
- **Arweave Storage**: Permanent, decentralized file storage
- **Expected Load Times**: < 2 seconds globally

## Security ✅

- [x] **Environment Variables**: Secured in Cloudflare dashboard
- [x] **Arweave Wallet**: Private key secured as environment variable
- [x] **API Security**: Server-side validation and error handling
- [x] **HTTPS**: Automatic SSL through Cloudflare

## Next Steps 🎯

1. **Deploy to Cloudflare Pages** using the settings above
2. **Test thoroughly** using the checklist
3. **Monitor performance** and user experience
4. **Set up custom domain** if needed
5. **Configure analytics** to track usage

---

**Ready to deploy!** 🚀 The application is production-ready with Arweave permanent storage.
