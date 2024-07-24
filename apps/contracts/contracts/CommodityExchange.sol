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

    mapping(string => bool) public approvedCommodities;

    event CommodityListed(uint256 indexed commodityId, string indexed commodityType, address indexed producer, int64 quantity, uint256 price, uint256 deliveryWindow);
    event CommodityApproved(string indexed commodityType);
    event CommodityRemoved(string indexed commodityType);

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

    function approveCommodity(string memory commodityType) external onlyAdmin {
        approvedCommodities[commodityType] = true;
        emit CommodityApproved(commodityType);
    }

    function removeCommodity(string memory commodityType) external onlyAdmin {
        approvedCommodities[commodityType] = false;
        emit CommodityRemoved(commodityType);
    }

    function listCommodity(string memory commodityType, int64 quantity, uint256 price, uint256 deliveryWindow) external {
        require(quantity > 0, "Quantity must be greater than zero");
        require(price > 0, "Price must be greater than zero");
        require(deliveryWindow > block.timestamp, "Delivery window must be in the future");

        // check if commodityType is approved
        require(approvedCommodities[commodityType], "Commodity type not approved for listing");

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

    function getListedCommodities() public view returns (Commodity[] memory) {
        Commodity[] memory result = new Commodity[](commodityCount);
        for (uint256 i = 0; i < commodityCount; i++) {
            result[i] = commodities[i];
        }
        return result;
    }

}
