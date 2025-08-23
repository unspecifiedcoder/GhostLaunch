import { ethers } from "hardhat";

// The Key class is part of the project's core cryptographic library.
// It is imported directly as it contains complex logic that shouldn't be replicated.
import { Key } from "eerc-sdk";
// --- ⚠️ HARDCODED CONFIGURATION FOR TESTING ---
// Security Warning: Do not use this script with real private keys in a production environment.
const CONFIG = {
  VAULT_ADDRESS: "0xF6475Ba5D26Bd817afAc3ded9b8018bEaf7Acf9A",
  VAULT_PRIVATE_KEY: "0xd54f7ac055f1a6cd6cef65e269f7ecb195154d69215cca6f45de5c3d9e80006c",
  CONTRACTS: {
    // These addresses are from your localhost deployment log
    EncryptedERC: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    Registrar: "0x5FC8d32690591D4c958F7876aA5fa8e5DB5E43B3",
  },
};
// ---------------------------------------------

// Helper function to format logs
const log = (message: string) => console.log(`\n---\n[LOG] ${message}\n---\n`);

async function main() {
    console.log("genereated allocations.json file");
  log("🚀 Starting Hardcoded Vault Decryption Script");

  // Create wallet and Key object from the hardcoded private key
  const vaultWallet = new ethers.Wallet(CONFIG.VAULT_PRIVATE_KEY);
  const vaultKey = new Key(vaultWallet.privateKey);
  console.log(`\n🔑 Vault EOA: ${vaultWallet.address}`);

  // Connect to the deployed contracts using hardcoded addresses
  const encryptedERC = await ethers.getContractAt("EncryptedERC", CONFIG.CONTRACTS.EncryptedERC);
  const registrar = await ethers.getContractAt("Registrar", CONFIG.CONTRACTS.Registrar);
  console.log(`\n🔗 Connected to EncryptedERC at: ${CONFIG.CONTRACTS.EncryptedERC}`);

  // Filter for transfer events (commitmentType = 1)
  const transferEventFilter = encryptedERC.filters.NewEncryptedCommitment(1);
  const allTransferEvents = await encryptedERC.queryFilter(transferEventFilter, 0, "latest");

  if (allTransferEvents.length === 0) {
    console.log("\nNo private transfer events were found.");
    return;
  }

  const recentEvents = allTransferEvents.slice(-2);
  log(`\n🔎 Found ${allTransferEvents.length} total transfers. Decrypting the last ${recentEvents.length}...`);

  for (const event of recentEvents) {
    if ('args' in event) {
      const { ciphertext } = event.args;
      
      console.log("\n--------------------------------------------------");
      console.log(`🧾 Transaction Hash: ${event.transactionHash}`);
      
      try {
        // 1. Decrypt the ciphertext
        const decryptedData = vaultKey.decrypt(ciphertext);
        const amount = decryptedData[0];
        const senderPubKey = {
          x: decryptedData[1].toString(),
          y: decryptedData[2].toString()
        };

        // 2. Look up the sender's Ethereum address
        const senderAddress = await registrar.getAccount([senderPubKey.x, senderPubKey.y]);

        console.log(`✅ Decryption Successful!`);
        console.log(`   - From: ${senderAddress}`);
        console.log(`   - Amount: ${amount.toString()} private tokens`);

      } catch (error) {
        console.log("❌ Decryption failed. This transaction was likely not intended for your vault's public key.");
      }
      console.log("--------------------------------------------------");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});