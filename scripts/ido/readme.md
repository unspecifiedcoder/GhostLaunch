# Private IDO on eERC-20: Quick Start Guide

This guide provides a complete, step-by-step workflow for deploying the eERC-20 system and running a private IDO on a local Hardhat network.

## 1. Initial Setup

### Prerequisites
1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:** Create a `.env` file from the example and add your local Hardhat node's private keys.
    ```bash
    cp .env.example .env
    # Edit .env to add your PRIVATE_KEY, PRIVATE_KEY2, etc. and RPC_URL
    ```

3.  **Start Local Node:** Run this command in a separate, dedicated terminal.
    ```bash
    npx hardhat node
    ```

4.  **Place IDO Contracts:** Ensure `IDO.sol` and `ProjectToken.sol` are located in the `contracts/` directory.

---

## 2. Part I: Deploy Core eERC-20 System

Follow these steps to deploy the foundational privacy layer.

### Step 1: Compile ZK Circuits
This command compiles the Circom circuits required for zero-knowledge proofs.

```bash
npx hardhat zkit:compile
```

### Step 2: Deploy Basic Components
Deploys verifier contracts, libraries, and a test ERC20 token.

```bash
npx hardhat run scripts/converter/01_deploy-basics.ts --network localhost
```

### Step 3: Deploy Main Contracts
Deploys the `Registrar` and `EncryptedERC` contracts.

```bash
npx hardhat run scripts/converter/02_deploy-converter.ts --network localhost
```

### Step 4: Register Users
Each participant (vault, investors) must register. Update your `.env` file with the correct `PRIVATE_KEY` for each user before running.

```bash
# Register Vault (using PRIVATE_KEY)
npx hardhat run scripts/converter/03_register-user.ts --network localhost

# Register Alice (using PRIVATE_KEY2, update .env to use it)
npx hardhat run scripts/converter/03_register-user.ts --network localhost
```

### Step 5: Fund and Deposit
Investors get public tokens and deposit them to receive private eERC-20 tokens.

```bash
# Fund Alice (ensure .env is set to her key)
npx hardhat run scripts/converter/05_get_faucet.ts --network localhost

# Alice deposits her public tokens
npx hardhat run scripts/converter/06_deposit.ts --network localhost
```
*Repeat this step for all investors.*

---

## 3. Part II: Run the Private IDO

With the eERC-20 system live, you can now launch the IDO.

### Step 1: Deploy IDO Contracts
This deploys your `ProjectToken.sol` and `IDO.sol`.

```bash
npx hardhat run scripts/ido/01_deploy_ido.ts --network localhost
```
**➡️ Action:** Save the deployed `IDO` contract address from the output.

### Step 2: Investors Contribute Privately
Each investor runs the transfer script to send their private tokens to the vault.

```bash
# Example for Alice. Set her PRIVATE_KEY in .env.
# RECIPIENT_PK is the vault's public key from its .keys.json file.
RECIPIENT_PK=<VAULT_PUBLIC_KEY> AMOUNT=10 npx hardhat run scripts/converter/07_transfer.ts --network localhost
```

### Step 3: Tally & Build Merkle Tree
After the contribution period, the owner performs these off-chain actions.

1.  **Decrypt** the incoming transactions using the Go decryption tool to get final amounts.
2.  **Create** the allocation file: `scripts/ido/allocations.json`.
3.  **Run** the build script:
    ```bash
    npx hardhat run scripts/ido/02_build_merkle.ts
    ```
**➡️ Action:** Save the `MERKLE_ROOT` from the output.

### Step 4: Finalize the IDO
Lock the sale results on-chain.

```bash
IDO_ADDRESS=<YOUR_IDO_ADDRESS> \
MERKLE_ROOT=<YOUR_MERKLE_ROOT> \
npx hardhat run scripts/ido/03_finalize_ido.ts --network localhost
```

### Step 5: Fund the IDO Contract
The owner deposits the total amount of `MPT` to be claimed.

```bash
IDO_ADDRESS=<YOUR_IDO_ADDRESS> \
AMOUNT="1500.0" \
npx hardhat run scripts/ido/04_fund_ido.ts --network localhost
```

### Step 6: Investors Claim Tokens
The final step. This script claims tokens for all investors at once and verifies their balances.

```bash
IDO_ADDRESS=<YOUR_IDO_ADDRESS> \
npx hardhat run scripts/ido/06_multi_claim_and_verify.ts --network localhost
```

**Congratulations! Your private IDO is complete.**