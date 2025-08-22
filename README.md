# 👻 GhostLaunch - A Private IDO Platform

GhostLaunch is a platform for conducting private Initial DEX Offerings (IDOs). It leverages the power of the Encrypted ERC (eERC) system to allow investors to contribute funds privately. Contributor amounts are hidden on-chain during the sale, and a public token claim is enabled after the sale concludes.

## How GhostLaunch Works

The process is divided into three main phases:

1.  ** funding Phase (Private) 🕵️**: Investors convert a public ERC20 token (e.g., `TEST`) into its private eERC-20 equivalent. They then contribute these private tokens to the IDO's vault address. On-chain observers can see that a transfer occurred, but not the amount.
2.  **Tally Phase (Off-Chain) 🧮**: After the funding period ends, the project owner uses a secure key to decrypt the incoming private transfers. They tally the contributions, calculate the corresponding project token allocations, and build a Merkle tree of the final results.
3.  **Claim Phase (Public)  दावा**: The owner publishes the Merkle root on the `IDO` smart contract. This locks in the sale results. Investors can then use their Merkle proof to publicly claim their share of the new project token (`MPT`).

## Prerequisites

* Node.js and npm installed
* Private keys for testing (for a deployer/vault and at least two investors)
* Local Hardhat node or a configured testnet (like Fuji)

## Environment Setup

Create a `.env` file in the root directory:

```bash
# Local Hardhat Node RPC or Testnet RPC
RPC_URL=[http://127.0.0.1:8545/](http://127.0.0.1:8545/)

# Private keys for testing (without 0x prefix)
PRIVATE_KEY=your_deployer_and_vault_private_key
PRIVATE_KEY2=your_investor_one_private_key
PRIVATE_KEY3=your_investor_two_private_key

# The public address of the vault (must match the deployer for local testing)
VAULT_EOA=0xYourVaultAddress
```

## Installation

```bash
npm install
```

---

## 📋 Quick Start Guide

This guide walks through the entire process on a local Hardhat node.

### Part I: Core eERC-20 System Setup

First, deploy the underlying privacy infrastructure.

**1. Start Local Node**
Run this in a separate, dedicated terminal.
```bash
npx hardhat node
```

**2. Compile ZK Circuits**
This is a one-time setup step to compile the circuits.
```bash
npx hardhat zkit:compile
```

**3. Deploy Basic Components**
Deploys verifiers, libraries, and the underlying `TEST` token used for contributions.
```bash
npx hardhat run scripts/converter/01_deploy-basics.ts --network localhost
```

**4. Deploy Main Contracts**
Deploys the `Registrar` and `EncryptedERC` contracts.
```bash
npx hardhat run scripts/converter/02_deploy-converter.ts --network localhost
```

**5. Register Users**
Each participant (the vault and all investors) must register. Update your `.env` file with the correct `PRIVATE_KEY` for each user before running.
```bash
# Register Vault (using PRIVATE_KEY)
npx hardhat run scripts/converter/03_register-user.ts --network localhost

# Register Investor 1 (using PRIVATE_KEY2, update .env)
npx hardhat run scripts/converter/03_register-user.ts --network localhost
```

**6. Fund and Deposit**
Investors get public `TEST` tokens and deposit them to receive private tokens.
```bash
# Fund Investor 1 (ensure .env is set to their key)
npx hardhat run scripts/converter/05_get_faucet.ts --network localhost

# Investor 1 deposits their public tokens
npx hardhat run scripts/converter/06_deposit.ts --network localhost
```
*Repeat this step for all investors.*

---

### Part II: Running Your GhostLaunch IDO

With the core system live, you can now launch your IDO.

**1. Deploy IDO Contracts**
This deploys your `ProjectToken.sol` and `IDO.sol`.
```bash
npx hardhat run scripts/ido/01_deploy_ido.ts --network localhost
```
**➡️ Action:** Save the deployed `IDO` contract address from the output.

**2. Investors Contribute Privately**
Each investor runs the transfer script to send their private tokens to the vault.
```bash
# Example for Investor 1. Set their PRIVATE_KEY in .env.
# RECIPIENT_PK is the vault's public key from its .keys.json file.
RECIPIENT
