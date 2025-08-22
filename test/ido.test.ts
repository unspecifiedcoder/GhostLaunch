import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";

describe("IDO Contract", function () {
  let ido: any, token: any;
  let owner: any, alice: any, bob: any, carol: any, vault: any;
  let start: number, end: number;

  beforeEach(async () => {
    [owner, alice, bob, carol, vault] = await ethers.getSigners();

    // Deploy Project Token
    const ProjectToken = await ethers.getContractFactory("ProjectToken");
    token = await ProjectToken.deploy(ethers.parseEther("1000000"));
    await token.waitForDeployment();

    // Deploy IDO
    start = (await ethers.provider.getBlock("latest")).timestamp + 10;
    end = start + 3600;
    const IDO = await ethers.getContractFactory("IDO");
    ido = await IDO.deploy(await token.getAddress(), vault.address, start, end);

    // Owner approves IDO for token deposits
    await token.connect(owner).approve(await ido.getAddress(), ethers.parseEther("1000000"));
  });

  // Utility: build Merkle tree from allocations
  function makeMerkleTree(allocations: [string, bigint][]) {
    const leaves = allocations.map(([account, amount]) =>
      Buffer.from(
        ethers.keccak256(
          ethers.solidityPacked(["address", "uint256"], [account, amount])
        ).slice(2),
        "hex"
      )
    );

    const tree = new MerkleTree(
      leaves,
      (data: Buffer) =>
        Buffer.from(ethers.keccak256(data).slice(2), "hex"),
      { sortPairs: true }
    );

    return { tree, leaves };
  }

  it("full IDO flow (happy path)", async () => {
    const allocs: [string, bigint][] = [
      [alice.address, ethers.parseEther("1000")],
      [bob.address, ethers.parseEther("300")],
      [carol.address, ethers.parseEther("700")],
    ];
    const { tree } = makeMerkleTree(allocs);

    // Publish root & finalize
    await ido.setMerkleRoot(tree.getHexRoot());
    await ido.finalize();

    // Deposit tokens
    await ido.depositProjectTokens(ethers.parseEther("2000"));

    // Move time to start
    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    // Alice claims
    const leafAlice = Buffer.from(
      ethers.keccak256(
        ethers.solidityPacked(["address", "uint256"], [alice.address, allocs[0][1]])
      ).slice(2),
      "hex"
    );
    const proofAlice = tree.getHexProof(leafAlice);

    await expect(ido.connect(alice).claim(alice.address, allocs[0][1], proofAlice))
      .to.emit(ido, "Claimed").withArgs(alice.address, allocs[0][1]);

    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("1000"));

    // Double-claim should fail
    await expect(ido.connect(alice).claim(alice.address, allocs[0][1], proofAlice))
      .to.be.revertedWithCustomError(ido, "NothingToClaim");

    // Bob claims
    const leafBob = Buffer.from(
      ethers.keccak256(
        ethers.solidityPacked(["address", "uint256"], [bob.address, allocs[1][1]])
      ).slice(2),
      "hex"
    );
    const proofBob = tree.getHexProof(leafBob);
    await ido.connect(bob).claim(bob.address, allocs[1][1], proofBob);

    expect(await token.balanceOf(bob.address)).to.equal(ethers.parseEther("300"));
  });

  // --- Extra Negative Tests ---

  it("only owner can set root, finalize, and deposit", async () => {
    await expect(ido.connect(alice).setMerkleRoot(ethers.ZeroHash))
      .to.be.revertedWithCustomError(ido, "NotOwner");

    await expect(ido.connect(alice).finalize())
      .to.be.revertedWithCustomError(ido, "NotOwner");

    await expect(ido.connect(alice).depositProjectTokens(1000))
      .to.be.revertedWithCustomError(ido, "NotOwner");
  });

  it("cannot finalize twice or set root after finalization", async () => {
    await ido.setMerkleRoot(ethers.keccak256(ethers.toUtf8Bytes("root")));
    await ido.finalize();

    await expect(ido.finalize())
      .to.be.revertedWithCustomError(ido, "AlreadyFinalized");

    await expect(ido.setMerkleRoot(ethers.keccak256(ethers.toUtf8Bytes("newroot"))))
      .to.be.revertedWithCustomError(ido, "AlreadyFinalized");
  });

  it("cannot finalize without root", async () => {
    await expect(ido.finalize()).to.be.revertedWith("ROOT_NOT_SET");
  });

  it("cannot claim before start or after end", async () => {
    const allocs: [string, bigint][] = [[alice.address, ethers.parseEther("1000")]];
    const { tree } = makeMerkleTree(allocs);

    await ido.setMerkleRoot(tree.getHexRoot());
    await ido.finalize();
    await ido.depositProjectTokens(ethers.parseEther("1000"));

    // Before start
    const leaf = Buffer.from(
      ethers.keccak256(
        ethers.solidityPacked(["address", "uint256"], [alice.address, allocs[0][1]])
      ).slice(2),
      "hex"
    );
    const proof = tree.getHexProof(leaf);

    await expect(ido.connect(alice).claim(alice.address, allocs[0][1], proof))
      .to.be.revertedWithCustomError(ido, "NotStarted");

    // Move time after end
    await ethers.provider.send("evm_increaseTime", [4000]);
    await ethers.provider.send("evm_mine");

    await expect(ido.connect(alice).claim(alice.address, allocs[0][1], proof))
      .to.be.revertedWithCustomError(ido, "Ended");
  });

  it("rejects invalid proof", async () => {
    const allocs: [string, bigint][] = [[alice.address, ethers.parseEther("1000")]];
    const { tree } = makeMerkleTree(allocs);
 
    await ido.setMerkleRoot(tree.getHexRoot());
    await ido.finalize();
    await ido.depositProjectTokens(ethers.parseEther("1000"));

    // move time inside claim window
    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    // Carol is not in the tree
    const fakeLeaf = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [carol.address, ethers.parseEther("1000")]
    );
    const fakeProof = tree.getHexProof(Buffer.from(fakeLeaf.slice(2), "hex"));

    await expect(
      ido.connect(carol).claim(carol.address, ethers.parseEther("1000"), fakeProof)
    ).to.be.revertedWithCustomError(ido, "InvalidProof");
  });

  it("remaining() returns correct values", async () => {
    const allocs: [string, bigint][] = [[alice.address, ethers.parseEther("1000")]];
    const { tree } = makeMerkleTree(allocs);

    await ido.setMerkleRoot(tree.getHexRoot());
    await ido.finalize();
    await ido.depositProjectTokens(ethers.parseEther("1000"));

    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    const leaf = Buffer.from(
      ethers.keccak256(
        ethers.solidityPacked(["address", "uint256"], [alice.address, allocs[0][1]])
      ).slice(2),
      "hex"
    );
    const proof = tree.getHexProof(leaf);

    // Before claim
    expect(await ido.remaining(alice.address, allocs[0][1])).to.equal(ethers.parseEther("1000"));

    // Claim
    await ido.connect(alice).claim(alice.address, allocs[0][1], proof);

    // After claim
    expect(await ido.remaining(alice.address, allocs[0][1])).to.equal(0);
  });
});
