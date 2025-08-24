#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
NETWORK="fuji"

# Temporary files to store script outputs
DEPLOY_LOG="deploy_output.log"
BUILD_LOG="build_output.log"

echo "🚀 Starting Full IDO Setup Script for '$NETWORK' 🚀"
echo "----------------------------------------------------"

# --- STEP 1: Deploy IDO and ProjectToken Contracts ---
echo "STEP 1: Deploying IDO contracts..."
# Run the deployment script, show output in console, AND save it to a file
npx hardhat run scripts/ido/01_deploy_ido.ts --network $NETWORK | tee $DEPLOY_LOG

# Extract the addresses from the saved log file
IDO_ADDRESS=$(grep "IDO deployed to:" $DEPLOY_LOG | awk '{print $4}')
TOKEN_ADDRESS=$(grep "ProjectToken deployed to:" $DEPLOY_LOG | awk '{print $4}')

# Check if we got the addresses
if [ -z "$IDO_ADDRESS" ] || [ -z "$TOKEN_ADDRESS" ]; then
    echo "❌ ERROR: Could not extract contract addresses from deployment script."
    rm $DEPLOY_LOG
    exit 1
fi
echo "✅ Addresses captured successfully."
echo "----------------------------------------------------"


# --- STEP 2: Build Merkle Tree and Get Root ---
echo "STEP 2: Building Merkle tree..."
# Run the build script, show output, AND save it to a file
npx hardhat run scripts/ido/02_build_merkle.ts --network $NETWORK | tee $BUILD_LOG

# Extract the Merkle root from the log file
MERKLE_ROOT=$(grep "MERKLE_ROOT:" $BUILD_LOG | awk '{print $2}')

# Check if we got the root
if [ -z "$MERKLE_ROOT" ]; then
    echo "❌ ERROR: Could not extract Merkle root from build script."
    rm $DEPLOY_LOG $BUILD_LOG
    exit 1
fi
echo "✅ Merkle Root captured successfully."
echo "----------------------------------------------------"


# --- STEP 3: Finalize the IDO with the Merkle Root ---
echo "STEP 3: Setting Merkle Root and Finalizing IDO..."
# Run the finalize script with the captured environment variables
# This will also print its full output directly
IDO_ADDRESS=$IDO_ADDRESS MERKLE_ROOT=$MERKLE_ROOT npx hardhat run scripts/ido/03_finalize_ido.ts --network $NETWORK

echo "✅ IDO Finalized."
echo "----------------------------------------------------"
echo "🎉 All IDO setup steps completed successfully! 🎉"
echo ""
echo "Deployment Summary:"
echo "  ProjectToken Address: $TOKEN_ADDRESS"
echo "  IDO Address:          $IDO_ADDRESS"
echo "  Merkle Root:          $MERKLE_ROOT"

