/**
 * Arweave Wallet Generato    console.log('💰 Fund this wallet with AR tokens at:');
    console.log('https://www.arweave.org/');
    console.log('Or buy AR from exchanges like Binance, Coinbase, etc.');and Test Script
 * 
 * This script helps you generate an Arweave wallet and test the connection.
 * Run with: node scripts/arweave-setup.js
 */

const Arweave = require('arweave');

// Initialize Arweave (mainnet)
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function generateWallet() {
  try {
    console.log('🔑 Generating new Arweave wallet...');
    
    // Generate a new wallet
    const wallet = await arweave.wallets.generate();
    
    // Get the wallet address
    const address = await arweave.wallets.jwkToAddress(wallet);
    
    console.log('✅ Wallet generated successfully!');
    console.log('📍 Address:', address);
    console.log('🔐 Wallet key (copy this to your .env.local file):');
    console.log(JSON.stringify(wallet));
    console.log('\n💰 Fund this wallet with test AR tokens at:');
    console.log('https://faucet.arweave.net/');
    
    return { wallet, address };
  } catch (error) {
    console.error('❌ Error generating wallet:', error);
    throw error;
  }
}

async function testWallet(wallet) {
  try {
    console.log('\n🧪 Testing wallet connection...');
    
    const address = await arweave.wallets.jwkToAddress(wallet);
    const balance = await arweave.wallets.getBalance(address);
    const balanceAR = arweave.ar.winstonToAr(balance);
    
    console.log('✅ Wallet connection successful!');
    console.log('💰 Balance:', balanceAR, 'AR');
    
    if (parseFloat(balanceAR) === 0) {
      console.log('⚠️  Wallet has no AR tokens. Fund it by purchasing AR tokens.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing wallet:', error);
    return false;
  }
}

async function testUpload(wallet) {
  try {
    console.log('\n📤 Testing file upload...');
    
    const testData = 'Hello, Arweave! This is a test upload.';
    
    // Create transaction
    const transaction = await arweave.createTransaction({
      data: testData,
    }, wallet);
    
    // Add tags
    transaction.addTag('Content-Type', 'text/plain');
    transaction.addTag('App-Name', 'Meteora-Test');
    
    // Sign transaction
    await arweave.transactions.sign(transaction, wallet);
    
    // Submit transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200) {
      console.log('✅ Test upload successful!');
      console.log('🔗 Transaction ID:', transaction.id);
      console.log('🌐 URL: https://arweave.net/' + transaction.id);
      return true;
    } else {
      console.log('❌ Upload failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing upload:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Arweave Setup Script\n');
  
  // Check if wallet key is provided as argument
  const walletArg = process.argv[2];
  
  let wallet;
  
  if (walletArg) {
    try {
      wallet = JSON.parse(walletArg);
      console.log('🔑 Using provided wallet key...');
    } catch (error) {
      console.error('❌ Invalid wallet key format. Please provide valid JSON.');
      process.exit(1);
    }
  } else {
    // Generate new wallet
    const result = await generateWallet();
    wallet = result.wallet;
  }
  
  // Test wallet
  await testWallet(wallet);
  
  // Test upload (only if wallet has balance)
  const address = await arweave.wallets.jwkToAddress(wallet);
  const balance = await arweave.wallets.getBalance(address);
  const balanceAR = parseFloat(arweave.ar.winstonToAr(balance));
  
  if (balanceAR > 0) {
    await testUpload(wallet);
  } else {
    console.log('\n⏭️  Skipping upload test (no AR balance)');
  }
  
  console.log('\n✅ Setup complete!');
  console.log('📝 Don\'t forget to add the wallet key to your .env.local file as ARWEAVE_WALLET_KEY');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateWallet, testWallet, testUpload };
