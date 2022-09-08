// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityToken is ERC777, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators
    ) ERC777(name, symbol, defaultOperators) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount, "", "");
    }
}
