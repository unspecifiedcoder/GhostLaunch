// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProjectToken is ERC20 {
    constructor(uint256 supply) ERC20("MyProject", "MPT") {
        _mint(msg.sender, supply);
    }
}