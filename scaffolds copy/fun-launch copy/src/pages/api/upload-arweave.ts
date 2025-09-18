import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import Arweave from 'arweave';

// Environment variables
const RPC_URL = process.env.RPC_URL as string;
const POOL_CONFIG_KEY = process.env.POOL_CONFIG_KEY as string;
const ARWEAVE_WALLET_KEY = process.env.ARWEAVE_WALLET_KEY as string;

if (!RPC_URL || !POOL_CONFIG_KEY || !ARWEAVE_WALLET_KEY) {
  throw new Error('Missing required environment variables');
}

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

// Types
type UploadRequest = {
  tokenLogo: string;
  tokenName: string;
  tokenSymbol: string;
  mint: string;
  userWallet: string;
};

type Metadata = {
  name: string;
  symbol: string;
  image: string;
  description?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
};

type MetadataUploadParams = {
  tokenName: string;
  tokenSymbol: string;
  mint: string;
  image: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenLogo, tokenName, tokenSymbol, mint, userWallet } = req.body as UploadRequest;

    // Validate required fields
    if (!tokenLogo || !tokenName || !tokenSymbol || !mint || !userWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upload image to Arweave
    const imageUrl = await uploadImageToArweave(tokenLogo, mint);
    if (!imageUrl) {
      return res.status(400).json({ error: 'Failed to upload image to Arweave' });
    }

    // Upload metadata to Arweave
    const metadataUrl = await uploadMetadataToArweave({ 
      tokenName, 
      tokenSymbol, 
      mint, 
      image: imageUrl 
    });
    if (!metadataUrl) {
      return res.status(400).json({ error: 'Failed to upload metadata to Arweave' });
    }

    // Create pool transaction
    const poolTx = await createPoolTransaction({
      mint,
      tokenName,
      tokenSymbol,
      metadataUrl,
      userWallet,
    });

    res.status(200).json({
      success: true,
      imageUrl,
      metadataUrl,
      poolTx: poolTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString('base64'),
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function uploadImageToArweave(tokenLogo: string, mint: string): Promise<string | false> {
  try {
    // Parse base64 data URL
    const matches = tokenLogo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('Invalid base64 data URL format');
      return false;
    }

    const [, contentType, base64Data] = matches;
    if (!contentType || !base64Data) {
      console.error('Missing content type or base64 data');
      return false;
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // Get wallet key
    const walletKey = JSON.parse(ARWEAVE_WALLET_KEY);

    // Create transaction
    const transaction = await arweave.createTransaction({
      data: fileBuffer,
    }, walletKey);

    // Add tags
    transaction.addTag('Content-Type', contentType);
    transaction.addTag('App-Name', 'Meteora-Token-Logo');
    transaction.addTag('Mint', mint);
    
    // Sign transaction
    await arweave.transactions.sign(transaction, walletKey);

    // Submit transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200) {
      const imageUrl = `https://arweave.net/${transaction.id}`;
      console.log('Image uploaded to Arweave:', imageUrl);
      return imageUrl;
    } else {
      console.error('Failed to upload image to Arweave:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error uploading image to Arweave:', error);
    return false;
  }
}

async function uploadMetadataToArweave(params: MetadataUploadParams): Promise<string | false> {
  try {
    // Create metadata object
    const metadata: Metadata = {
      name: params.tokenName,
      symbol: params.tokenSymbol,
      image: params.image,
      description: `${params.tokenName} (${params.tokenSymbol}) token metadata`,
      attributes: [
        {
          trait_type: 'Mint',
          value: params.mint
        },
        {
          trait_type: 'Storage',
          value: 'Arweave'
        }
      ]
    };

    // Get wallet key
    const walletKey = JSON.parse(ARWEAVE_WALLET_KEY);

    // Create transaction
    const transaction = await arweave.createTransaction({
      data: JSON.stringify(metadata, null, 2),
    }, walletKey);

    // Add tags
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('App-Name', 'Meteora-Token-Metadata');
    transaction.addTag('Mint', params.mint);
    transaction.addTag('Token-Name', params.tokenName);
    transaction.addTag('Token-Symbol', params.tokenSymbol);
    
    // Sign transaction
    await arweave.transactions.sign(transaction, walletKey);

    // Submit transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200) {
      const metadataUrl = `https://arweave.net/${transaction.id}`;
      console.log('Metadata uploaded to Arweave:', metadataUrl);
      return metadataUrl;
    } else {
      console.error('Failed to upload metadata to Arweave:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error uploading metadata to Arweave:', error);
    return false;
  }
}

async function createPoolTransaction({
  mint,
  tokenName,
  tokenSymbol,
  metadataUrl,
  userWallet,
}: {
  mint: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUrl: string;
  userWallet: string;
}) {
  const connection = new Connection(RPC_URL, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  const poolTx = await client.pool.createPool({
    config: new PublicKey(POOL_CONFIG_KEY),
    baseMint: new PublicKey(mint),
    name: tokenName,
    symbol: tokenSymbol,
    uri: metadataUrl,
    payer: new PublicKey(userWallet),
    poolCreator: new PublicKey(userWallet),
  });

  const { blockhash } = await connection.getLatestBlockhash();
  poolTx.feePayer = new PublicKey(userWallet);
  poolTx.recentBlockhash = blockhash;

  return poolTx;
}
