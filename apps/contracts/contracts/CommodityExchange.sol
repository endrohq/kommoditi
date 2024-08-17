// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./liquidity/TokenAuthority.sol";
import "./liquidity/CommodityFactory.sol";
import "./liquidity/CommodityPool.sol";
import "./ParticipantRegistry.sol";

contract CommodityExchange {
    address public admin;
    CommodityFactory public factory;
    TokenAuthority public tokenAuthority;
    ParticipantRegistry public participantRegistry;

    event CommodityTokenCreated(address indexed tokenAddress, string name, string symbol);
    event CommodityListed(address indexed tokenAddress, int64[] serialNumbers, address indexed producer);
    event LiquidityProvided(address indexed tokenAddress, address indexed provider, uint256 amount, uint256 minPrice, uint256 maxPrice);
    event LiquidityRemoved(address indexed tokenAddress, address indexed provider, uint256 amount);
    event ConsumerFundsAdded(address indexed tokenAddress, address indexed consumer, uint256 amount);
    event ConsumerFundsWithdrawn(address indexed tokenAddress, address indexed consumer, uint256 amount);
    event DistributorPurchaseMade(address indexed tokenAddress, address indexed distributor, uint256 listingId);
    event ConsumerPurchaseMade(address indexed tokenAddress, address indexed consumer, address indexed distributor, uint256 quantity);

    constructor(address _factory, address _participantRegistry) {
        admin = msg.sender;
        factory = CommodityFactory(_factory);
        participantRegistry = ParticipantRegistry(_participantRegistry);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function setTokenAuthority(address _tokenAuthority) external onlyAdmin {
        require(address(tokenAuthority) == address(0), "TokenAuthority already set");
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    function createCommodityToken(string memory name, string memory symbol) external onlyAdmin {
        address tokenAddress = tokenAuthority.createToken(name, symbol);
        factory.createPool(tokenAddress);
        emit CommodityTokenCreated(tokenAddress, name, symbol);
    }

    function listCommodity(address tokenAddress, int64 quantity) external {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this token");
        require(participantRegistry.getParticipantByAddress(msg.sender).participantType == ParticipantRegistry.ParticipantType.Producer, "Only producers can list commodities");

        int64[] memory serialNumbers = tokenAuthority.mintNFT(tokenAddress, msg.sender, quantity);
        CommodityPool(poolAddress).addListing(msg.sender, serialNumbers);

        emit CommodityListed(tokenAddress, serialNumbers, msg.sender);
    }

    function provideLiquidity(address tokenAddress, uint256 minPrice, uint256 maxPrice) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");
        require(participantRegistry.getParticipantByAddress(msg.sender).participantType == ParticipantRegistry.ParticipantType.Distributor, "Only Distributors can provide liquidity");

        CommodityPool(poolAddress).provideLiquidity{value: msg.value}(msg.sender, minPrice, maxPrice);

        emit LiquidityProvided(tokenAddress, msg.sender, msg.value, minPrice, maxPrice);
    }

    function addConsumerFunds(address tokenAddress) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");
        require(participantRegistry.getParticipantByAddress(msg.sender).participantType == ParticipantRegistry.ParticipantType.Consumer, "Only consumers can add funds");

        CommodityPool(poolAddress).consumerProvideFunds{value: msg.value}(msg.sender);

        emit ConsumerFundsAdded(tokenAddress, msg.sender, msg.value);
    }

    function distributorManualBuy(address tokenAddress, uint256 listingId) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool(poolAddress).distributorManualBuy{value: msg.value}(msg.sender, listingId);

        emit DistributorPurchaseMade(tokenAddress, msg.sender, listingId);
    }

    function consumerBuyFromDistributor(address tokenAddress, address distributor, uint256 quantity) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");
        // require(participantRegistry.getParticipantByAddress(msg.sender).participantType == ParticipantRegistry.ParticipantType.Consumer, "Only consumers can buy from Distributors");

        CommodityPool(poolAddress).consumerBuyFromDistributor{value: msg.value}(msg.sender, distributor, quantity);

        emit ConsumerPurchaseMade(tokenAddress, msg.sender, distributor, quantity);
    }

}
