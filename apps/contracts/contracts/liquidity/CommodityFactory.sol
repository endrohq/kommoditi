// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CommodityPool.sol";

contract CommodityFactory {
    address public admin;
    address public commodityExchange;
    mapping(address => address) public commodityPoolsByToken; // token address => pool address
    address[] public allPools;
    address public participantRegistry;
    bool public isHedera;

    struct Pool {
        address tokenAddress;
        address poolAddress;
    }

    event PoolCreated(address indexed tokenAddress, address indexed poolAddress);

    constructor(address _participantRegistry, bool _isHedera) {
        admin = msg.sender;
        participantRegistry = _participantRegistry;
        isHedera = _isHedera;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == admin, "Only CommodityExchange can perform this action");
        _;
    }

    function setCommodityExchange(address _commodityExchange) external onlyAdmin {
        commodityExchange = _commodityExchange;
    }


    function createPool(address tokenAddress) external returns (address) {

        CommodityPool newPool = new CommodityPool(tokenAddress, commodityExchange, address(participantRegistry), isHedera);
        commodityPoolsByToken[tokenAddress] = address(newPool);
        allPools.push(address(newPool));

        emit PoolCreated(tokenAddress, address(newPool));

        return address(newPool);
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

    function getPoolByToken(address tokenAddress) external view returns (address) {
        return commodityPoolsByToken[tokenAddress];
    }


}
