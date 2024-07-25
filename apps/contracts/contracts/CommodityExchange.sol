// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TokenAuthority.sol";

contract CommodityExchange {

    struct ApprovedCommodity {
        address tokenAddress;
        bool approved;
    }

    address public admin;
    TokenAuthority public tokenAuthority;

    struct Commodity {
        address tokenAddress;
        address producer;
        int64 quantity;
        uint256 price;
        uint256 deliveryWindow;
        bool isActive;
    }

    mapping(uint256 => Commodity) public commodities;
    uint256 public commodityCount;
    ApprovedCommodity[] public approvedCommodities;

    event CommodityListed(uint256 indexed commodityId, address indexed tokenAddress, address indexed producer, int64 quantity, uint256 price, uint256 deliveryWindow);
    event CommodityApproved(address indexed tokenAddress);
    event CommodityRemoved(address indexed tokenAddress);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyTokenAuthority() {
        require(msg.sender == address(tokenAuthority), "Only TokenAuthority can perform this action");
        _;
    }

    function setTokenAuthority(address _tokenAuthority) external onlyAdmin {
        tokenAuthority = TokenAuthority(_tokenAuthority);
    }

    function isApprovedCommodity(address tokenAddress) public view returns (bool) {
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


    function listCommodity(address tokenAddress, int64 quantity, uint256 price, uint256 deliveryWindow) external {
        /*require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be greater than zero");
        require(deliveryWindow > block.timestamp, "Delivery window must be in the future");*/

        uint256 index = findApprovedCommodityIndex(tokenAddress);
        require(approvedCommodities[index].approved, "Commodity not approved");

        // Request token minting
        int64 responseCode = tokenAuthority.requestMinting(tokenAddress, quantity, msg.sender);
        require(responseCode == 0, "Token minting failed");

        uint256 commodityId = commodityCount;
        commodityCount++;

        commodities[commodityId] = Commodity({
            tokenAddress: tokenAddress,
            producer: msg.sender,
            quantity: quantity,
            price: price,
            deliveryWindow: deliveryWindow,
            isActive: true
        });

        emit CommodityListed(commodityId, tokenAddress, msg.sender, quantity, price, deliveryWindow);
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
    }

}
