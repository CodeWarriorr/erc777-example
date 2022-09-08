// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICharityOperator {
  function operatorSend(
        IERC777 token,
        address from,
        address to,
        uint256 amount
    ) external;
}

contract CharityOperator is Ownable {
    mapping(address => bool) _charityPools;

    modifier onlyCharityPool() {
        require(_charityPools[msg.sender] == true, "Only Charity Pool can access");
        _;
    }

    function addCharityPool(address charityPool) external onlyOwner {
        _charityPools[charityPool] = true;
    }

    function removeCharityPool(address charityPool) external onlyOwner {
        _charityPools[charityPool] = false;
    }

    function operatorSend(
        IERC777 token,
        address from,
        address to,
        uint256 amount
    ) external onlyCharityPool {
      token.operatorSend(from, to, amount, "", "");
    }
}
