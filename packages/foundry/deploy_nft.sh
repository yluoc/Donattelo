#!/bin/bash

echo "🚀 Deploying DonatelloNFT to Base..."
echo ""

# Check if we're in the right directory
if [ ! -f "foundry.toml" ]; then
    echo "❌ Error: Please run this script from the packages/foundry directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Please edit .env file and add your DEPLOYER_PRIVATE_KEY"
    echo "   You can generate a new account with: yarn generate"
    exit 1
fi

echo "🔧 Building contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🌐 Deploying to Base Sepolia (testnet)..."
echo "   (Use 'base' instead of 'baseSepolia' for mainnet deployment)"
echo ""

# Deploy to Base Sepolia
forge script script/DeployDonatelloNFT.s.sol \
    --rpc-url baseSepolia \
    --broadcast \
    --verify \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the contract address from the output above"
    echo "2. Update packages/nextjs/components/NFTMinter.tsx"
    echo "3. Replace 'const DONATELLO_NFT_CONTRACT = \"0x...\"' with your address"
    echo "4. Test the minting functionality in your app!"
    echo ""
else
    echo "❌ Deployment failed!"
    echo "   Make sure you have:"
    echo "   - Sufficient ETH for gas fees"
    echo "   - Valid DEPLOYER_PRIVATE_KEY in .env"
    echo "   - Correct network configuration"
fi
