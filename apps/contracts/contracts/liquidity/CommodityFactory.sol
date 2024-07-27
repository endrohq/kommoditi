// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CommodityPool.sol";
import "./TokenAuthority.sol";

contract CommodityFactory {
    address public admin;
    address public commodityExchange;
    TokenAuthority public tokenAuthority;
    mapping(address => address) public commodityPoolsByToken; // token address => pool address
    address[] public allPools;

    struct Pool {
        address tokenAddress;
        address poolAddress;
    }

    event PoolCreated(address indexed tokenAddress, address indexed poolAddress);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyCommodityExchange() {
        console.log("msg.sender: %s", msg.sender);
        console.log("admin: %s", commodityExchange);
        require(msg.sender == admin, "Only CommodityExchange can perform this action");
        _;
    }

    function setCommodityExchange(address _commodityExchange) external onlyAdmin {
        commodityExchange = _commodityExchange;
    }

    function setTokenAuthority(address _tokenAuthority) external onlyAdmin {
        require(address(tokenAuthority) == address(0), "TokenAuthority already set");
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    function createPool(address tokenAddress) external onlyAdmin {
        require(address(tokenAuthority) != address(0), "TokenAuthority not set");
        // require(tokenAuthority.isApprovedToken(tokenAddress), "Token not approved for trading");
        require(commodityPoolsByToken[tokenAddress] == address(0), "Pool already exists");

        CommodityPool newPool = new CommodityPool(tokenAddress, address(tokenAuthority), commodityExchange);
        commodityPoolsByToken[tokenAddress] = address(newPool);
        allPools.push(address(newPool));

        emit PoolCreated(tokenAddress, address(newPool));
    }

    function allPoolsLength() external view returns (uint) {
        return allPools.length;
    }

    function getAllPools() external view returns (Pool[] memory) {
        Pool[] memory pools = new Pool[](allPools.length);
        for (uint i = 0; i < allPools.length; i++) {
            pools[i] = Pool({
                tokenAddress: CommodityPool(allPools[i]).tokenAddress(),
                poolAddress: allPools[i]
            });
        }
        return pools;
    }

}
