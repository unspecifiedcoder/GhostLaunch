import React, { useState } from "react";
import { ethers } from "ethers";
import { EncryptedERC__factory, Registrar__factory, SimpleERC20__factory } from "../typechain-types";

interface Props {
  encryptedERC: string;
  registrar: string;
  testERC20: string;
  signer: any;
  setStatus: (msg: string) => void;
}

export const PrivateTransfer: React.FC<Props> = ({ encryptedERC, registrar, testERC20, signer, setStatus }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  async function doTransfer() {
    try {
      if (!isValidAddress(receiver)) throw new Error("Invalid receiver address");
      setStatus("⏳ Starting private transfer...");

      const eerc = EncryptedERC__factory.connect(encryptedERC, signer);
      const reg = Registrar__factory.connect(registrar, signer);
      const token = SimpleERC20__factory.connect(testERC20, signer);

      const sender = await signer.getAddress();

      const isSenderRegistered = await reg.isUserRegistered(sender);
      const isReceiverRegistered = await reg.isUserRegistered(receiver);
      if (!isSenderRegistered || !isReceiverRegistered) {
        throw new Error("❌ Both sender and receiver must be registered");
      }

      // TODO: Integrate privateTransfer() logic from helpers.
      // For now just a placeholder.
      setStatus("⚠️ Private transfer proof generation not yet wired to frontend. Use backend script.");

    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
  }

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">🔐 Private Transfer (EncryptedERC)</h2>
      <input
        type="text"
        placeholder="Receiver Address"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        className="border px-2 py-1 rounded w-full my-2"
      />
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-2 py-1 rounded w-full my-2"
      />
      <button
        onClick={doTransfer}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg"
      >
        Send Private Transfer
      </button>
    </div>
  );
};
