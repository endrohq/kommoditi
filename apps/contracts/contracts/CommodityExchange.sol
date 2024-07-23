// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IHederaTokenService.sol";
import "./TokenAuthority.sol";

contract CommodityExchange {
    address public admin;
    TokenAuthority public tokenAuthority;

    struct Commodity {
        string commodityType;
        address producer;
        int64 quantity;
        uint256 price;
        uint256 deliveryWindow;
        bool isActive;
    }

    mapping(uint256 => Commodity) public commodities;
    uint256 public commodityCount;

    mapping(string => bool) public approvedCommodityTypes;

    event CommodityListed(uint256 indexed commodityId, string indexed commodityType, address indexed producer, int64 quantity, uint256 price, uint256 deliveryWindow);
    event CommodityTypeApproved(string indexed commodityType);
    event CommodityTypeRemoved(string indexed commodityType);

    constructor(address _tokenAuthority) {
        tokenAuthority = TokenAuthority(_tokenAuthority);
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

    function approveCommodityType(string memory commodityType) external onlyAdmin {
        approvedCommodityTypes[commodityType] = true;
        emit CommodityTypeApproved(commodityType);
    }

    function removeCommodityType(string memory commodityType) external onlyAdmin {
        approvedCommodityTypes[commodityType] = false;
        emit CommodityTypeRemoved(commodityType);
    }

    function listCommodity(string memory commodityType, int64 quantity, uint256 price, uint256 deliveryWindow) external {
        require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be greater than zero");
        require(deliveryWindow > block.timestamp, "Delivery window must be in the future");

        // check if commodityType is approved
        require(approvedCommodityTypes[commodityType], "Commodity type not approved for listing");

        // Request token minting
        int64 responseCode = tokenAuthority.requestMinting(commodityType, quantity, deliveryWindow, msg.sender);
        require(responseCode == 0, "Token minting failed");

        uint256 commodityId = commodityCount;
        commodityCount++;

        commodities[commodityId] = Commodity({
            commodityType: commodityType,
            producer: msg.sender,
            quantity: quantity,
            price: price,
            deliveryWindow: deliveryWindow,
            isActive: true
        });

        emit CommodityListed(commodityId, commodityType, msg.sender, quantity, price, deliveryWindow);
    }

    function getCommodity(uint256 commodityId) public view returns (Commodity memory) {
        require(commodityId < commodityCount, "Commodity does not exist");
        return commodities[commodityId];
    }

    function getCommodities() public view returns (Commodity[] memory) {
        Commodity[] memory result = new Commodity[](commodityCount);
        for (uint256 i = 0; i < commodityCount; i++) {
            result[i] = commodities[i];
        }
        return result;
    }

    function getCommodityTokenAddress(string memory commodityType) public view returns (address) {
        return tokenAuthority.getCommodityTokenAddress(commodityType);
    }
}
