// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./liquidity/TokenAuthority.sol";
import "./liquidity/CommodityFactory.sol";
import "./liquidity/CommodityPool.sol";
import "hardhat/console.sol";

contract CommodityExchange {

    address public admin;

    event CommodityApproved(address indexed tokenAddress);
    event CommodityRemoved(address indexed tokenAddress);
    event CommodityLPCreated(address indexed poolAddress);
    event CommodityLPAdded(address indexed poolAddress);
    event CommodityListed(address indexed poolAddress, int64[] indexed serialNumber, address indexed producer);
    event CommodityListed(address indexed poolAddress, int64[] indexed serialNumber, address indexed producer);

    CommodityFactory public factory;
    TokenAuthority public tokenAuthority;

    constructor(address _factory) {
        admin = msg.sender;
        factory = CommodityFactory(_factory);
    }

    function setTokenAuthority(address _tokenAuthority) external {
        require(address(tokenAuthority) == address(0), "TokenAuthority already set");
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyTokenAuthority() {
        require(msg.sender == address(tokenAuthority), "Only TokenAuthority can perform this action");
        _;
    }

    function createCommodityToken(string memory name, string memory symbol) external {
        address tokenAddress = tokenAuthority.createToken(name, symbol);
        factory.createPool(tokenAddress);
    }

    function listCommodity(address tokenAddress, int64 quantity) external {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this token");


        int64[] memory serialNumbers = tokenAuthority.mintNFT(tokenAddress, msg.sender, quantity);
        CommodityPool(poolAddress).addListing(msg.sender, serialNumbers);

        emit CommodityListed(tokenAddress, serialNumbers, msg.sender);
    }

    function purchaseCommodity(address tokenAddress, uint256 quantity) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).purchaseCommodity{value: msg.value}(msg.sender, quantity);
    }

    function purchaseCommodityFromCTF(address tokenAddress, address ctf, uint256 quantity) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).purchaseFromCTF{value: msg.value}(msg.sender, ctf, quantity);
    }

    function provideLiquidity(address tokenAddress, uint256 minPrice, uint256 maxPrice) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).provideLiquidity{value: msg.value}(msg.sender, minPrice, maxPrice);

        emit CommodityLPAdded(poolAddress);
    }

    function removeLiquidity(address tokenAddress, uint256 amount) external {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool pool = CommodityPool(poolAddress);
        pool.removeLiquidity(msg.sender, amount);
    }

}
