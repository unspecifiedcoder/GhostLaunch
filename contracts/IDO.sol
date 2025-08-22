// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract IDO is ReentrancyGuard {
    IERC20 public projectToken;   // token being sold (public ERC20)
    address public owner;         // admin
    address public vaultEOA;      // address where encrypted TEST deposits go

    uint64 public startTime;
    uint64 public endTime;
    bool public finalized;

    bytes32 public merkleRoot; // root over {account, allocation}
    mapping(address => uint256) public claimed;

    event RootUpdated(bytes32 root);
    event Finalized();
    event Claimed(address indexed account, uint256 amount);
    event ProjectTokensDeposited(address indexed from, uint256 amount);

    error NotOwner();
    error AlreadyFinalized();
    error NotStarted();
    error Ended();
    error InvalidProof();
    error NothingToClaim();

    constructor(address _token, address _vault, uint64 _start, uint64 _end) {
        require(_token != address(0), "TOKEN_ZERO");
        require(_vault != address(0), "VAULT_ZERO");
        projectToken = IERC20(_token);
        owner = msg.sender;
        vaultEOA = _vault;
        startTime = _start;
        endTime = _end;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        if (finalized) revert AlreadyFinalized();
        merkleRoot = root;
        emit RootUpdated(root);
    }

    function finalize() external onlyOwner {
        if (finalized) revert AlreadyFinalized();
        require(merkleRoot != bytes32(0), "ROOT_NOT_SET");
        finalized = true;
        emit Finalized();
    }

    /// @notice Deposit project tokens to the IDO contract (owner must approve first)
    function depositProjectTokens(uint256 amount) external onlyOwner {
        require(projectToken.transferFrom(msg.sender, address(this), amount), "TRANSFER_FROM_FAILED");
        emit ProjectTokensDeposited(msg.sender, amount);
    }

    /**
     * @notice Claim up to `allocation` (minus what was already claimed) using a Merkle proof.
     * @param account The claimer address (usually msg.sender).
     * @param allocation The total allocation assigned to `account` in the Merkle tree (in token base units).
     * @param proof Merkle proof for leaf = keccak256(abi.encodePacked(account, allocation))
     */
    function claim(address account, uint256 allocation, bytes32[] calldata proof)
        external
        nonReentrant
    {
        if (block.timestamp < startTime) revert NotStarted();
        if (endTime != 0 && block.timestamp > endTime) revert Ended();
        if (!_verify(_leaf(account, allocation), proof)) revert InvalidProof();

        uint256 already = claimed[account];
        if (already >= allocation) revert NothingToClaim();

        uint256 toSend = allocation - already;
        claimed[account] = allocation;

        require(projectToken.transfer(account, toSend), "TRANSFER_FAILED");
        emit Claimed(account, toSend);
    }

    // --- helpers ---

    function _leaf(address account, uint256 allocation) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account, allocation));
    }

    function _verify(bytes32 leaf, bytes32[] calldata proof) internal view returns (bool ok) {
        bytes32 h = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];
            h = h <= p ? keccak256(abi.encodePacked(h, p)) : keccak256(abi.encodePacked(p, h));
        }
        return h == merkleRoot;
    }

    // convenience: view remaining claim for account/allocation
    function remaining(address account, uint256 allocation) external view returns (uint256) {
        uint256 already = claimed[account];
        return allocation > already ? allocation - already : 0;
    }
}
