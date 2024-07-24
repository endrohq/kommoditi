// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IHederaTokenService.sol";

contract TokenAuthority {
    address public commodityExchange;
    IHederaTokenService public tokenService;
    address public admin;

    mapping(address => bool) public authorizedProducers;
    mapping(string => address) public commodityTokens;
    string[] public commodityTypes;

    event ProducerAuthorized(address indexed producer);
    event ProducerRevoked(address indexed producer);
    event CommodityCreated(string indexed commodityType, address tokenAddress);
    event CommodityMinted(string indexed commodityType, address indexed producer, int64 amount);

    constructor(address _commodityExchange, address _tokenService) {
        commodityExchange = _commodityExchange;
        tokenService = IHederaTokenService(_tokenService);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyCommodityExchange() {
        require(msg.sender == commodityExchange, "Only CommodityExchange can perform this action");
        _;
    }

    function authorizeProducer(address producer) external onlyAdmin {
        authorizedProducers[producer] = true;
        emit ProducerAuthorized(producer);
    }

    function revokeProducer(address producer) external onlyAdmin {
        authorizedProducers[producer] = false;
        emit ProducerRevoked(producer);
    }

    function createCommodity(string memory commodityType, string memory name, string memory symbol) external {
        require(commodityTokens[commodityType] == address(0), "Token for this commodity already exists");

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken({
            name: name,
            symbol: symbol,
            treasury: address(this),
            memo: string(abi.encodePacked("Commodity Token for ", commodityType)),
            supplyType: true, // Infinite supply
            maxSupply: 0, // No maximum supply
            freezeDefault: false,
            expiry: IHederaTokenService.Expiry({
            second: 0,
            autoRenewPeriod: 0
        })
        });

        (int64 responseCode, address createdToken) = tokenService.createFungibleToken(token, 0, 0, new IHederaTokenService.TokenKey[](0));
        require(responseCode == 0, "Token creation failed");

        commodityTokens[commodityType] = createdToken;
        commodityTypes.push(commodityType);
        emit CommodityCreated(commodityType, createdToken);
    }

    function requestMinting(string memory commodityType, int64 amount, uint256 deliveryWindow, address producer) external onlyCommodityExchange returns (int64 responseCode) {
        require(authorizedProducers[producer], "Producer is not authorized");
        address tokenAddress = commodityTokens[commodityType];
        require(tokenAddress != address(0), "Token for this commodity does not exist");

        // Mint new tokens
        (responseCode,, ) = tokenService.mintToken(tokenAddress, amount, new bytes[](0));
        require(responseCode == 0, "Token minting failed");

        // Transfer the minted tokens to the producer
        (responseCode) = tokenService.transferToken(tokenAddress, address(this), producer, amount);
        require(responseCode == 0, "Token transfer to producer failed");

        emit CommodityMinted(commodityType, producer, amount);

        return responseCode;
    }

    function getCommodityTypes() external view returns (string[] memory) {
        return commodityTypes;
    }

    function getCommodities() external view returns (address[] memory) {
        address[] memory tokens = new address[](commodityTypes.length);
        for (uint256 i = 0; i < commodityTypes.length; i++) {
            tokens[i] = commodityTokens[commodityTypes[i]];
        }
        return tokens;
    }

}
