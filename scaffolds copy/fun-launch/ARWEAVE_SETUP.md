# Arweave Integration

This project now supports uploading token metadata and images to Arweave for permanent storage.

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Generate an Arweave wallet:**
   You need an Arweave wallet key to upload to Arweave. You can:
   
   - Generate one using the Arweave CLI:
     ```bash
     npm install -g arweave
     arweave key-create arweave-wallet.json
     ```
   
   - Or use the ArConnect browser extension to create a wallet and export the key
   
   - For testing, you can use a test wallet (funded with test AR tokens)

3. **Add the wallet key to your environment:**
   Copy the entire contents of your Arweave wallet JSON file and paste it as the value for `ARWEAVE_WALLET_KEY` in your `.env.local` file:
   
   ```bash
   ARWEAVE_WALLET_KEY={"kty":"RSA","n":"...","e":"AQAB","d":"...","p":"...","q":"...","dp":"...","dq":"...","qi":"..."}
   ```

4. **Fund your wallet:**
   To upload to Arweave, you need AR tokens. For testing:
   - Use a testnet faucet
   - For mainnet, you'll need to purchase AR tokens

## API Endpoints

- `/api/upload-arweave` - New endpoint that uploads to Arweave
- `/api/upload` - Original endpoint that uploads to Cloudflare R2

## Features

- **Permanent Storage**: Files uploaded to Arweave are permanently stored on the blockchain
- **Decentralized**: No reliance on centralized storage providers
- **Metadata Tags**: Images and metadata are tagged for easy discovery
- **Error Handling**: Comprehensive error handling for upload failures

## Usage

The create-pool page now uses the Arweave API by default. When you create a token:

1. The token logo is uploaded to Arweave
2. Token metadata (including Arweave image URL) is uploaded to Arweave
3. The pool is created with the Arweave metadata URL

## Cost Considerations

Arweave charges a one-time fee for permanent storage. The cost depends on file size:
- Small images (< 100KB): ~$0.01-0.05
- Metadata JSON files: ~$0.001-0.01

Check current pricing at [arweave.net](https://arweave.net)
