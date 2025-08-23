import React, { useState } from "react";

interface Props {
  fundIDO: (amount: string) => Promise<void>;
  claimTokens: () => Promise<void>;
  finalizeIDO: () => Promise<void>;
}

export const IDOActions: React.FC<Props> = ({ fundIDO, claimTokens, finalizeIDO }) => {
  const [amount, setAmount] = useState("");

  return (
    <>
      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Fund IDO (Owner only)</h2>
        <input
          type="text"
          placeholder="Amount of tokens"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <button
          onClick={() => fundIDO(amount)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Fund
        </button>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Claim Allocation</h2>
        <button
          onClick={claimTokens}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Claim
        </button>
      </div>

      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold">Finalize IDO (Owner only)</h2>
        <button
          onClick={finalizeIDO}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Finalize
        </button>
      </div>
    </>
  );
};
