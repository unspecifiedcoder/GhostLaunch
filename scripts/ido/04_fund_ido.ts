import { ethers } from "hardhat";

async function main() {
    const ido = await ethers.getContractAt("IDO", process.env.IDO_ADDRESS!);
    const token = await ethers.getContractAt("ProjectToken", await ido.projectToken());
    const amount = ethers.parseEther(process.env.AMOUNT!);
    await token.approve(await ido.getAddress(), amount);
    await ido.depositProjectTokens(amount);
    console.log(`Funded IDO with ${process.env.AMOUNT} MPT.`);
}
main().catch(console.error);