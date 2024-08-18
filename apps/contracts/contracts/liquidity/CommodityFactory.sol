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

    function setTokenAuthority(address _tokenAuthority) external onlyAdmin {
        require(address(tokenAuthority) == address(0), "TokenAuthority already set");
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    function createPool(address tokenAddress) external {
        require(address(tokenAuthority) != address(0), "TokenAuthority not set");
        // require(tokenAuthority.isApprovedToken(tokenAddress), "Token not approved for trading");
        require(commodityPoolsByToken[tokenAddress] == address(0), "Pool already exists");

        CommodityPool newPool = new CommodityPool(tokenAddress, address(tokenAuthority), commodityExchange, address(participantRegistry), isHedera);
        commodityPoolsByToken[tokenAddress] = address(newPool);
        allPools.push(address(newPool));

        emit PoolCreated(tokenAddress, address(newPool));
    }


}
