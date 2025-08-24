#!/bin/bash
# This script automates the deployment and setup for the eERC-20 converter.
# It will exit immediately if any command fails.
set -e

# Define the network to use
NETWORK="fuji"

echo "🚀 Starting Full Deployment & Setup Script for '$NETWORK' 🚀"
echo "----------------------------------------------------"

# Step 1: Deploy Basic Contracts
echo "STEP 1: Deploying Basic Contracts (Verifiers, etc.)..."
npx hardhat run scripts/converter/01_deploy-basics.ts --network $NETWORK
echo "✅ Basic contracts deployed."
echo "----------------------------------------------------"

# Step 2: Deploy Converter Contracts
echo "STEP 2: Deploying Converter Contracts (EncryptedERC, Registrar)..."
npx hardhat run scripts/converter/02_deploy-converter.ts --network $NETWORK
echo "✅ Converter contracts deployed."
echo "----------------------------------------------------"

# Step 3: Register Users (Wallets 1, 2, 3)
echo "STEP 3: Registering Users for Wallets 1, 2, and 3..."
npx hardhat run scripts/converter/03_register-user.ts --network $NETWORK
echo "✅ Users registered."
echo "----------------------------------------------------"

# Step 4: Set Auditor (Only needs to be done once by the owner/deployer, which is wallet 1)
echo "STEP 4: Setting the Auditor..."
npx hardhat run scripts/converter/04_set-auditor.ts --network $NETWORK
echo "✅ Auditor set."
echo "----------------------------------------------------"

# Step 5: Get Faucet Tokens (for Wallets 1, 2, 3)
echo "STEP 5: Claiming Faucet Tokens for Wallets 1, 2, and 3..."
npx hardhat run scripts/converter/05_get_faucet.ts --network $NETWORK
echo "✅ Faucet tokens claimed."
echo "----------------------------------------------------"

# Step 6: Deposit Tokens (for Wallets 1, 2, 3)
echo "STEP 6: Depositing Tokens for Wallets 1, 2, and 3..."
npx hardhat run scripts/converter/06_deposit.ts --network $NETWORK
echo "✅ Tokens deposited."
echo "----------------------------------------------------"

echo "🎉 All steps completed successfully! 🎉"