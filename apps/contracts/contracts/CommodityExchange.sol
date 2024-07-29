// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./liquidity/TokenAuthority.sol";
import "./liquidity/CommodityFactory.sol";
import "./liquidity/CommodityPool.sol";
import "hardhat/console.sol";

contract CommodityExchange {

    address public admin;

    event CommodityListed(uint256 indexed commodityId, address indexed tokenAddress, address indexed producer, int64 quantity, uint256 price, uint256 deliveryWindow);
    event CommodityApproved(address indexed tokenAddress);
    event CommodityRemoved(address indexed tokenAddress);
    event CommodityLPCreated(address indexed poolAddress);
    event CommodityLPAdded(address indexed poolAddress);
    event CommodityListed(address indexed poolAddress);

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

    function listCommodity(address tokenAddress, int64 quantity, uint256 price) external {
        require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be greater than zero");

        // require(tokenAuthority.isApprovedToken(tokenAddress), "Token not approved for trading");
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool pool = CommodityPool(poolAddress);
        pool.addListing(msg.sender, quantity, price);

        emit CommodityListed(tokenAddress);
    }

    function purchaseCommodity(address tokenAddress, int64 quantity, uint256 maxPrice) external payable {
        // require(tokenAuthority.isApprovedToken(tokenAddress), "Token not approved for trading");
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool pool = CommodityPool(poolAddress);
        pool.purchaseCommodity{value: msg.value}(msg.sender, quantity, maxPrice);
    }

    function provideLiquidity(address tokenAddress, uint256 minPrice, uint256 maxPrice) external payable {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool pool = CommodityPool(poolAddress);
        pool.provideLiquidity{value: msg.value}(msg.sender, minPrice, maxPrice);

        emit CommodityLPAdded(poolAddress);
    }

    function removeLiquidity(address tokenAddress, uint256 amount) external {
        address poolAddress = factory.commodityPoolsByToken(tokenAddress);
        require(poolAddress != address(0), "No pool exists for this commodity");

        CommodityPool pool = CommodityPool(poolAddress);
        pool.removeLiquidity(msg.sender, amount);
    }

    /*function isApprovedCommodity(address tokenAddress) public view returns (bool) {
        for (uint256 i = 0; i < approvedCommodities.length; i++) {
            if (approvedCommodities[i].tokenAddress == tokenAddress) {
                return approvedCommodities[i].approved;
            }
        }
        return false;
    }

    function approveCommodity(address tokenAddress) external onlyAdmin {
        uint256 index = findApprovedCommodityIndex(tokenAddress);
        if (index == approvedCommodities.length) {
            approvedCommodities.push(ApprovedCommodity({
                tokenAddress: tokenAddress,
                approved: true
            }));
        } else {
            // Update the existing commodity's approved status
            approvedCommodities[index].approved = true;
        }

        emit CommodityApproved(tokenAddress);
    }

    function findApprovedCommodity(address tokenAddress) internal view returns (ApprovedCommodity memory) {
        for (uint256 i = 0; i < approvedCommodities.length; i++) {
            if (approvedCommodities[i].tokenAddress == tokenAddress) {
                return approvedCommodities[i];
            }
        }
        revert("Commodity not approved");
    }

    function findApprovedCommodityIndex(address tokenAddress) internal view returns (uint256) {
        for (uint256 i = 0; i < approvedCommodities.length; i++) {
            if (approvedCommodities[i].tokenAddress == tokenAddress) {
                return i;
            }
        }
        return approvedCommodities.length; // Return length as indicator of not found
    }

    function removeCommodity(address tokenAddress) external onlyAdmin {
        uint256 index = findApprovedCommodityIndex(tokenAddress);
        require(index < approvedCommodities.length && approvedCommodities[index].approved, "Commodity not approved");
        require(approvedCommodities[index].approved, "Commodity not approved");

        approvedCommodities[index].approved = false;

        emit CommodityRemoved(tokenAddress);
    }

    function getApprovedCommodities() public view returns (ApprovedCommodity[] memory) {
        return approvedCommodities;
    }

    function getCommodity(uint256 commodityId) public view returns (Commodity memory) {
        require(commodityId < commodityCount, "Commodity does not exist");
        return commodities[commodityId];
    }

    function getListedCommodities() public view returns (Commodity[] memory) {
        Commodity[] memory result = new Commodity[](commodityCount);
        for (uint256 i = 0; i < commodityCount; i++) {
            result[i] = commodities[i];
        }
        return result;
    }*/

}
