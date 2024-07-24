// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./IHederaTokenService.sol";

contract TokenAuthority {

    struct CommodityToken {
        string symbol;
        address tokenAddress;
    }

    address public commodityExchange;
    IHederaTokenService public tokenService;
    address public admin;

    mapping(address => bool) public authorizedProducers;
    mapping(string => address) public commodityTokens;
    string[] public commoditySymbols;

    event ProducerAuthorized(address indexed producer);
    event ProducerRevoked(address indexed producer);
    event CommodityCreated(string indexed commoditySymbol, address tokenAddress);
    event CommodityMinted(address indexed tokenAddress, address indexed producer, int64 amount);

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

    function createCommodity(string memory name, string memory symbol) external {
        require(commodityTokens[symbol] == address(0), "Token for this commodity already exists");

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken({
            name: name,
            symbol: symbol,
            treasury: address(this),
            memo: string(abi.encodePacked("Commodity Token for ", symbol)),
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

        commodityTokens[symbol] = createdToken;
        commoditySymbols.push(symbol);
        emit CommodityCreated(symbol, createdToken);
    }

    function requestMinting(address tokenAddress, int64 amount, uint256 deliveryWindow, address producer) external onlyCommodityExchange returns (int64 responseCode) {
        require(authorizedProducers[producer], "Producer is not authorized");
        require(tokenAddress != address(0), "Token for this commodity does not exist");

        // Mint new tokens
        (responseCode,, ) = tokenService.mintToken(tokenAddress, amount, new bytes[](0));
        require(responseCode == 0, "Token minting failed");

        // Transfer the minted tokens to the producer
        (responseCode) = tokenService.transferToken(tokenAddress, address(this), producer, amount);
        require(responseCode == 0, "Token transfer to producer failed");

        emit CommodityMinted(tokenAddress, producer, amount);

        return responseCode;
    }

    function getCommodityTypes() external view returns (string[] memory) {
        return commoditySymbols;
    }

    function getCommodities() external view returns (address[] memory) {
        address[] memory tokens = new address[](commoditySymbols.length);
        for (uint256 i = 0; i < commoditySymbols.length; i++) {
            tokens[i] = commodityTokens[commoditySymbols[i]];
        }
        return tokens;
    }

    function getCommodityToken(string memory commoditySymbol) external view returns (address) {
        return commodityTokens[commoditySymbol];
    }

    function getCommodityTokens () external view returns (CommodityToken[] memory) {
        CommodityToken[] memory tokens = new CommodityToken[](commoditySymbols.length);
        for (uint256 i = 0; i < commoditySymbols.length; i++) {
            tokens[i] = CommodityToken({
                symbol: commoditySymbols[i],
                tokenAddress: commodityTokens[commoditySymbols[i]]
            });
        }
        return tokens;
    }

}
