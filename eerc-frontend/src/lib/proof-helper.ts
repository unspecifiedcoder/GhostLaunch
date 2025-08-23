// src/lib/proof-helpers.ts

// Make sure to install snarkjs in your frontend project: npm install snarkjs
import { groth16 } from 'snarkjs';

// You may need to copy these type definitions from your backend project
// or create a shared types package.
type Point = [bigint, bigint];
interface User {
  privateKey: bigint;
  publicKey: Point;
  address: string;
}

export async function privateTransfer(
  sender: User,
  balance: bigint,
  receiverPublicKey: Point,
  amount: bigint,
  encryptedBalance: bigint[],
  auditorPublicKey: Point,
) {
  const inputs = {
    privateKey: sender.privateKey.toString(),
    balance: balance.toString(),
    receiverPublicKey: receiverPublicKey.map((v) => v.toString()),
    amount: amount.toString(),
    encryptedBalance: encryptedBalance.map((v) => v.toString()),
    auditorPublicKey: auditorPublicKey.map((v) => v.toString()),
  };

  // Note the paths now point to the files in your `public` directory
  const { proof, publicSignals } = await groth16.fullProve(
    inputs,
    '/circuits/transfer.wasm',
    '/circuits/transfer.zkey'
  );

  const senderBalancePCT = [
    BigInt(publicSignals[1]),
    BigInt(publicSignals[2]),
    BigInt(publicSignals[3]),
    BigInt(publicSignals[4]),
  ];

  return { proof, senderBalancePCT };
}