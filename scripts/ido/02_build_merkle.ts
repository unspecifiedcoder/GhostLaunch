import fs from "fs";
import { keccak256, solidityPacked, getAddress, ethers } from "ethers";
import { MerkleTree } from "merkletreejs";

function leafHash(address: string, allocationWei: bigint) {
  return keccak256(solidityPacked(['address', 'uint256'], [address, allocationWei]));
}

async function main() {
  const file = "scripts/ido/allocations.json";
  console.log(`Reading allocations from ${file}...`);
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  
  const leaves = [];
  const meta: { address: string; allocationWei: bigint }[] = [];

  for (const row of raw) {
    const allocationWei = ethers.parseEther(row.allocation.toString());
    meta.push({ address: getAddress(row.address), allocationWei });
    leaves.push(leafHash(getAddress(row.address), allocationWei));
  }

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();
  console.log("MERKLE_ROOT:", root);

  const proofs: Record<string, { allocationWei: string; proof: string[] }> = {};
  for (let i = 0; i < meta.length; i++) {
    proofs[meta[i].address] = {
      allocationWei: meta[i].allocationWei.toString(),
      proof: tree.getHexProof(leaves[i]),
    };
  }

  fs.writeFileSync("scripts/ido/proofs.json", JSON.stringify(proofs, null, 2));
  console.log("Wrote proofs to scripts/ido/proofs.json");
}
main().catch(console.error);