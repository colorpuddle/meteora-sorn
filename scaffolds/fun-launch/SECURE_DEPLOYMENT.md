# 🔐 Secure Deployment Options for Fun Launch

## Security Concerns with Direct Key Storage ⚠️

You're absolutely right! Storing the Arweave private key directly in Cloudflare environment variables poses security risks:

- ❌ Keys visible to anyone with Cloudflare dashboard access
- ❌ Potential logging/exposure in build processes
- ❌ No key rotation capability
- ❌ Single point of failure

## 🛡️ Secure Alternative 1: GitHub Actions + Encrypted Secrets

### Benefits:
- ✅ Keys stored as encrypted GitHub secrets
- ✅ No Wrangler dependency
- ✅ Automated deployment
- ✅ Better access control

### Setup:

1. **Create GitHub Secrets** (Repository → Settings → Secrets and variables → Actions):
```
ARWEAVE_WALLET_KEY_ENCRYPTED=[encrypted_key]
RPC_URL=https://api.devnet.solana.com
POOL_CONFIG_KEY=6hhdBg7hWQR7yEJmfpsGsZ4thfDEgHhteXzgSe8msXsn
CLOUDFLARE_API_TOKEN=[your_cf_token]
CLOUDFLARE_ACCOUNT_ID=[your_account_id]
```

2. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'scaffolds/fun-launch/package-lock.json'
      
      - name: Install dependencies
        working-directory: scaffolds/fun-launch
        run: npm ci
      
      - name: Build application
        working-directory: scaffolds/fun-launch
        run: npm run build
        env:
          ARWEAVE_WALLET_KEY: ${{ secrets.ARWEAVE_WALLET_KEY_ENCRYPTED }}
          RPC_URL: ${{ secrets.RPC_URL }}
          POOL_CONFIG_KEY: ${{ secrets.POOL_CONFIG_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: fun-launch
          directory: scaffolds/fun-launch/.next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## 🛡️ Secure Alternative 2: Dedicated Upload Wallet

### Benefits:
- ✅ Minimal security exposure
- ✅ Limited funds at risk
- ✅ Easy to rotate/replace
- ✅ Separation of concerns

### Setup:

1. **Generate Dedicated Arweave Wallet**:
```javascript
// scripts/generate-upload-wallet.js
const Arweave = require('arweave');

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function generateUploadWallet() {
  const key = await arweave.wallets.generate();
  const address = await arweave.wallets.jwkToAddress(key);
  
  console.log('Upload Wallet Address:', address);
  console.log('Send only 0.1-0.5 AR to this address for uploads');
  console.log('Store this key securely:', JSON.stringify(key));
}

generateUploadWallet();
```

2. **Fund Minimally**: Send only 0.1-0.5 AR to the upload wallet
3. **Use for Uploads Only**: This wallet is only for Arweave uploads

## 🛡️ Secure Alternative 3: Cloudflare KV + Encryption

### Benefits:
- ✅ Keys encrypted at rest
- ✅ Access controlled by Cloudflare Workers
- ✅ No environment variable exposure
- ✅ Runtime decryption only

### Setup:

1. **Create Encryption Helper**:
```javascript
// lib/crypto.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(encryptedData) {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipherGCM(ALGORITHM, ENCRYPTION_KEY);
  decipher.setIV(iv);
  decipher.setAuthTag(authTag);
  
  return decipher.update(encrypted, null, 'utf8') + decipher.final('utf8');
}
```

2. **Store Encrypted Key in KV**:
```javascript
// Store encrypted Arweave key in Cloudflare KV
// Access via: await KV.get('arweave_wallet_key')
```

## 🛡️ Secure Alternative 4: External Key Management Service

### Benefits:
- ✅ Enterprise-grade security
- ✅ Audit trails
- ✅ Key rotation
- ✅ Access policies

### Options:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Secret Manager**

## 🎯 Recommended Approach

**For your use case, I recommend Option 2: Dedicated Upload Wallet**

### Why:
1. **Simple**: No complex encryption setup needed
2. **Secure**: Limited exposure (only upload functionality)
3. **Cost-effective**: Minimal AR funding required
4. **Easy to rotate**: Generate new wallet anytime
5. **GitHub Actions**: Still use encrypted secrets for deployment

### Implementation:
1. Generate a dedicated Arweave wallet for uploads only
2. Fund it with minimal AR (0.1-0.5 AR)
3. Use GitHub Actions with encrypted secrets
4. Deploy directly to Cloudflare Pages (no Wrangler needed)

Would you like me to implement the dedicated upload wallet approach with GitHub Actions deployment?
