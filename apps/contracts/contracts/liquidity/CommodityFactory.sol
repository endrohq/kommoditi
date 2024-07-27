// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CommodityPool.sol";
import "./TokenAuthority.sol";

contract CommodityFactory {
    address public admin;
    TokenAuthority public tokenAuthority;
    mapping(address => address) public commodityPoolsByToken; // token address => pool address
    address[] public allPools;

    event PoolCreated(address indexed tokenAddress, address indexed poolAddress);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function setTokenAuthority(address _tokenAuthority) external onlyAdmin {
        require(address(tokenAuthority) == address(0), "TokenAuthority already set");
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    function createPool(address tokenAddress, address _commodityExchange) external onlyAdmin {
        require(address(tokenAuthority) != address(0), "TokenAuthority not set");
        require(tokenAuthority.isApprovedToken(tokenAddress), "Token not approved for trading");
        require(commodityPoolsByToken[tokenAddress] == address(0), "Pool already exists");

        CommodityPool newPool = new CommodityPool(tokenAddress, address(tokenAuthority), address(_commodityExchange));
        commodityPoolsByToken[tokenAddress] = address(newPool);
        allPools.push(address(newPool));

        emit PoolCreated(tokenAddress, address(newPool));
    }

    function allPoolsLength() external view returns (uint) {
        return allPools.length;
    }

    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
}
