import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const vaultEOA = process.env.VAULT_EOA || deployer.address;
  console.log(`Deploying IDO with Vault EOA: ${vaultEOA}`);

  const token = await ethers.deployContract("ProjectToken", [ethers.parseEther("1000000")]);
  await token.waitForDeployment();
  console.log("ProjectToken deployed to:", await token.getAddress());

  const now = Math.floor(Date.now() / 1000);
  const ido = await ethers.deployContract("IDO", [await token.getAddress(), vaultEOA, now - 60, now + 86400]);
  await ido.waitForDeployment();
  console.log("IDO deployed to:", await ido.getAddress());
}
main().catch(console.error);