// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./liquidity/CommodityFactory.sol";
import "./liquidity/CommodityPool.sol";

contract CommodityExchange {
    address public admin;
    CommodityFactory public factory;
    address[] public createdTokens;

    event CommodityTokenCreated(address indexed tokenAddress, address indexed poolAddress);
    event CommodityListed(address indexed tokenAddress, int64[] serialNumbers, address indexed producer);
    event LiquidityProvided(address indexed tokenAddress, address indexed provider, uint256 amount, uint256 minPrice, uint256 maxPrice);
    event LiquidityRemoved(address indexed tokenAddress, address indexed provider, uint256 amount);
    event ConsumerFundsAdded(address indexed tokenAddress, address indexed consumer, uint256 amount);
    event ConsumerFundsWithdrawn(address indexed tokenAddress, address indexed consumer, uint256 amount);
    event DistributorPurchaseMade(address indexed tokenAddress, address indexed distributor, uint256 listingId);
    event ConsumerPurchaseMade(address indexed tokenAddress, address indexed consumer, address indexed distributor, uint256 quantity);

    constructor(address _factory) {
        admin = msg.sender;
        factory = CommodityFactory(_factory);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function createCommodityToken(address tokenAddress) public {
        createdTokens.push(tokenAddress);
        address poolAddress = factory.createPool(tokenAddress);
        emit CommodityTokenCreated(tokenAddress, poolAddress);
    }

    function listCommodity(address tokenAddress, int64[] memory serialNumbers) external {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this token");

        CommodityPool(poolAddress).addListing(msg.sender, serialNumbers);
        emit CommodityListed(tokenAddress, serialNumbers, msg.sender);
    }

    /*function provideLiquidity(address tokenAddress, uint256 minPrice, uint256 maxPrice) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).provideLiquidity{value: msg.value}(msg.sender, minPrice, maxPrice);

        emit LiquidityProvided(tokenAddress, msg.sender, msg.value, minPrice, maxPrice);
    }*/

    /*function addConsumerFunds(address tokenAddress) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).consumerProvideFunds{value: msg.value}(msg.sender);

        emit ConsumerFundsAdded(tokenAddress, msg.sender, msg.value);
    }*/

    function distributorManualBuy(address tokenAddress, uint256 listingId) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).distributorManualBuy{value: msg.value}(msg.sender, listingId);

        emit DistributorPurchaseMade(tokenAddress, msg.sender, listingId);
    }

    function consumerBuyFromDistributor(address tokenAddress, address distributor, uint256 quantity) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).consumerBuyFromDistributor{value: msg.value}(msg.sender, distributor, quantity);

        emit ConsumerPurchaseMade(tokenAddress, msg.sender, distributor, quantity);
    }

}
