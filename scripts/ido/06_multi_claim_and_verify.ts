import { ethers } from "hardhat";
import fs from "fs";

// Helper function to format logs
const log = (message: string) => console.log(`\n--- ${message} ---\n`);

async function main() {
  log("🚀 Starting Multi-Claim and Balance Verification Script");

  // Get multiple signers from Hardhat. We'll skip the first one (deployer).
  const [, alice, bob] = await ethers.getSigners();
  const claimants = [alice, bob];

  if (!claimants.length || !claimants[0]) {
    throw new Error("Could not get claimant signers. Are you running on a local Hardhat node?");
  }

  // Load the proofs file once
  const proofs = JSON.parse(fs.readFileSync("scripts/ido/proofs.json", "utf-8"));

  // Connect to the IDO contract
  const ido = await ethers.getContractAt("IDO", process.env.IDO_ADDRESS!);

  // Get the ProjectToken (MPT) contract to check balances
  const projectTokenAddress = await ido.projectToken();
  const projectToken = await ethers.getContractAt("ProjectToken", projectTokenAddress);

  // Loop through each claimant and process their claim
  for (const claimant of claimants) {
    const claimantAddress = claimant.address;
    log(`Processing claim for: ${claimantAddress}`);

    const myProof = proofs[claimantAddress];
    if (!myProof) {
      console.log(`❌ No proof found for ${claimantAddress}. Skipping.`);
      continue;
    }

    // 1. Check balance BEFORE the claim
    const balanceBefore = await projectToken.balanceOf(claimantAddress);
    console.log(`MPT Balance (Before): ${ethers.formatEther(balanceBefore)} MPT`);

    // 2. Perform the claim
    console.log("Submitting claim transaction...");
    const tx = await ido.connect(claimant).claim(claimantAddress, myProof.allocationWei, myProof.proof);
    await tx.wait();
    console.log("✅ Claim transaction successful!");

    // 3. Check balance AFTER the claim
    const balanceAfter = await projectToken.balanceOf(claimantAddress);
    console.log(`MPT Balance (After):  ${ethers.formatEther(balanceAfter)} MPT`);
  }

  log("🎉 All claims processed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});