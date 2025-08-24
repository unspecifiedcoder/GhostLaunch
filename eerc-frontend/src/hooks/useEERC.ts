// hooks/useEERC.ts
import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useEERC as useEERCSDK } from "@avalabs/eerc-sdk";

export function useEERC() {
  // wagmi clients
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // local state
  const [eercAddress, setEercAddress] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // circuit URLs (adjust paths or host locally)
  const circuitURLs = {
    register: { wasm: "/circuits/register.wasm", zkey: "/circuits/register.zkey" },
    transfer: { wasm: "/circuits/transfer.wasm", zkey: "/circuits/transfer.zkey" },
    mint: { wasm: "/circuits/mint.wasm", zkey: "/circuits/mint.zkey" },
    withdraw: { wasm: "/circuits/withdraw.wasm", zkey: "/circuits/withdraw.zkey" },
    burn: { wasm: "/circuits/burn.wasm", zkey: "/circuits/burn.zkey" }
  };

  // init SDK
  const eerc = useEERCSDK(
    publicClient!,
    walletClient!,
    eercAddress,
    circuitURLs
  );

  // encrypted balance hook
  const {
    parsedDecryptedBalance,
    privateTransfer,
    refetchBalance
  } = eerc.useEncryptedBalance();

  // handlers
  const handleTransfer = async () => {
    if (!eerc.isRegistered || !privateTransfer) return;
    try {
      const tx = await privateTransfer(
        transferRecipient,
        BigInt(transferAmount) * 10n ** 2n // encrypted decimals = 2
      );
      console.log("✅ Private transfer sent:", tx.transactionHash);
    } catch (err) {
      console.error("❌ Transfer failed", err);
    }
  };

  const handleCheckBalance = async () => {
    try {
      await refetchBalance();
    } catch (err) {
      console.error("❌ Balance check failed", err);
    }
  };

  return {
    ...eerc,
    eercAddress, setEercAddress,
    transferRecipient, setTransferRecipient,
    transferAmount, setTransferAmount,
    decryptedBalance: parsedDecryptedBalance,
    handleTransfer,
    handleCheckBalance,
  };
}
