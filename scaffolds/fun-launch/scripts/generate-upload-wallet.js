const Arweave = require('arweave');

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function generateUploadWallet() {
  try {
    console.log('🔐 Generating dedicated Arweave upload wallet...\n');
    
    // Generate new wallet
    const key = await arweave.wallets.generate();
    const address = await arweave.wallets.jwkToAddress(key);
    
    console.log('✅ Upload Wallet Generated Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Wallet Address: ${address}`);
    console.log('💰 Recommended funding: 0.1 - 0.5 AR (for uploads only)');
    console.log('🔗 Fund at: https://faucet.arweave.net/ (testnet) or buy AR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔑 WALLET KEY (Store securely as GitHub Secret):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(key));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 SECURITY CHECKLIST:');
    console.log('▢ Store the wallet key as ARWEAVE_UPLOAD_WALLET_KEY in GitHub Secrets');
    console.log('▢ Fund the wallet with minimal AR (0.1-0.5 AR only)');
    console.log('▢ Use this wallet ONLY for Arweave uploads');
    console.log('▢ Never use this wallet for other transactions');
    console.log('▢ Rotate this key periodically for better security');
    console.log('\n🚀 Ready for secure deployment!');
    
  } catch (error) {
    console.error('❌ Error generating wallet:', error);
  }
}

// Run the generator
generateUploadWallet();
