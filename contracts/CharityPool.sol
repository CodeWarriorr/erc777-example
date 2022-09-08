// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC1820Registry.sol";
import "./PercentageMath.sol";
import "./CharityOperator.sol";

contract CharityPool is Ownable, IERC777Recipient {
    using PercentageMath for uint256;

    struct Distribution {
        address vault;
        string description;
        uint256 percentage;
    }

    IERC1820Registry internal constant _ERC1820_REGISTRY = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    ICharityOperator private _charityOperator;
    IERC777 private _charityToken;
    Distribution[] private _distribution;
    uint256 private _validUntil;
    uint256 private _totalCollected;

    event Funded(address owner, uint256 amount);

    constructor(
        ICharityOperator charityOperator,
        IERC777 charityToken,
        Distribution[] memory distribution,
        uint256 validUntil
    ) {
        uint256 totalPercentage;
        for (uint256 i = 0; i < distribution.length; i++) {
            totalPercentage += distribution[i].percentage;
            _distribution.push(distribution[i]);
        }
        require(totalPercentage == PercentageMath.PERCENTAGE, "Required allocated 100% distribution");

        _charityOperator = charityOperator;
        _charityToken = charityToken;
        _validUntil = validUntil;

        _ERC1820_REGISTRY.setInterfaceImplementer(address(this), keccak256("ERC777TokensRecipient"), address(this));
    }

    function fund(address from, uint256 amount) external onlyOwner {
        _charityOperator.operatorSend(_charityToken, from, address(this), amount);
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {
        operator;
        to;
        userData;
        operatorData;
        
        require(msg.sender == address(_charityToken), "Invalid token");
        require(block.timestamp <= _validUntil, "Charity collection has ended");

        uint totalSent;
        for (uint256 i = 0; i < _distribution.length; i++) {
            _charityToken.send(_distribution[i].vault, amount.percentMul(_distribution[i].percentage), "");
            totalSent += amount.percentMul(_distribution[i].percentage);
        }
        _totalCollected += amount;

        emit Funded(from, amount);
    }
}
