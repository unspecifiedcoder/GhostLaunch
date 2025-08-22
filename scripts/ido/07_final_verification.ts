import { ethers } from "hardhat";
import fs from "fs";

// Helper function to format logs
const log = (message: string) => console.log(`\n--- ${message} ---\n`);

async function main() {
  log("🚀 Starting Final Verification Script");

  // Get multiple signers from Hardhat. We'll skip the first one (deployer).
  const [, alice, bob] = await ethers.getSigners();
  const claimants = [alice, bob];

  if (!claimants.length || !claimants[0]) {
    throw new Error("Could not get claimant signers. Are you running on a local Hardhat node?");
  }

  // Load the proofs file once
  const proofs = JSON.parse(fs.readFileSync("scripts/ido/proofs.json", "utf-8"));

  // Connect to the IDO and ProjectToken contracts
  const ido = await ethers.getContractAt("IDO", process.env.IDO_ADDRESS!);
  const projectTokenAddress = await ido.projectToken();
  const projectToken = await ethers.getContractAt("ProjectToken", projectTokenAddress);

  // 1. Check IDO balance BEFORE any claims
  const idoBalanceBefore = await projectToken.balanceOf(await ido.getAddress());
  log(`IDO Contract Balance (Before All Claims): ${ethers.formatEther(idoBalanceBefore)} MPT`);

  // 2. Loop through each claimant and process their claim
  for (const claimant of claimants) {
    const claimantAddress = claimant.address;
    log(`Processing claim for: ${claimantAddress}`);

    const myProof = proofs[claimantAddress];
    if (!myProof) {
      console.log(`❌ No proof found for ${claimantAddress}. Skipping.`);
      continue;
    }

    // Check claimant balance before
    const balanceBefore = await projectToken.balanceOf(claimantAddress);
    console.log(`Claimant MPT Balance (Before): ${ethers.formatEther(balanceBefore)} MPT`);

    // Perform the claim
    console.log("Submitting claim transaction...");
    const tx = await ido.connect(claimant).claim(claimantAddress, myProof.allocationWei, myProof.proof);
    await tx.wait();
    console.log("✅ Claim transaction successful!");

    // Check claimant balance after
    const balanceAfter = await projectToken.balanceOf(claimantAddress);
    console.log(`Claimant MPT Balance (After):  ${ethers.formatEther(balanceAfter)} MPT`);
  }

  // 3. Check IDO balance AFTER all claims are done
  const idoBalanceAfter = await projectToken.balanceOf(await ido.getAddress());
  log(`IDO Contract Balance (After All Claims): ${ethers.formatEther(idoBalanceAfter)} MPT`);

  log("🎉 Verification Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});