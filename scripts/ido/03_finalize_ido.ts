import { ethers } from "hardhat";

async function main() {
    const ido = await ethers.getContractAt("IDO", process.env.IDO_ADDRESS!);
    await ido.setMerkleRoot(process.env.MERKLE_ROOT!);
    console.log("Merkle root set.");
    await ido.finalize();
    console.log("IDO finalized.");
}
main().catch(console.error);