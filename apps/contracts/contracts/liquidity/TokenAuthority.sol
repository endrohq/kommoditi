// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IHederaTokenService.sol";

import "hardhat/console.sol";

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

    uint64 private initialTotalSupply = 0;
    uint64 private maxSupply = 0;
    uint32 private decimals = 0;
    bool private freezeDefaultStatus = false;

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
        require(commodityTokens[symbol] == address(0), "Commodity already exists");

        IHederaTokenService.Expiry memory expiry = IHederaTokenService.Expiry(
            0, msg.sender, 0
        );

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken({
            name: name,
            symbol: symbol,
            treasury: commodityExchange,
            memo: string(abi.encodePacked("Commodity Token for ", symbol)),
            tokenSupplyType: true, // Infinite supply
            maxSupply: 0,
            freezeDefault: false, // Assuming freezeDefaultStatus is defined elsewhere
            expiry: expiry
        });

        (int responseCode, address tokenAddress) = tokenService.createFungibleToken(token, initialTotalSupply, decimals);

        require(responseCode == 0, "Token creation failed");

        commodityTokens[symbol] = tokenAddress;
        commoditySymbols.push(symbol);

        emit CommodityCreated(symbol, tokenAddress);
    }

    function requestMinting(address tokenAddress, int64 amount, address producer) external onlyCommodityExchange returns (int64 responseCode) {
        require(tokenAddress != address(0), "Token for this commodity does not exist");

        // Step 1: Ensure the producer is associated with the token
        (responseCode) = tokenService.associateToken(producer, tokenAddress);
        require(responseCode == 0 || responseCode == 4, "Producer token association failed"); // 4 is ACCOUNT_ALREADY_ASSOCIATED

        // Step 2: Mint new tokens (this adds them to the Treasury)
        (responseCode, , ) = tokenService.mintToken(tokenAddress, amount, new bytes[](0));
        require(responseCode == 0, "Token minting failed");

        (responseCode) = tokenService.transferToken(tokenAddress, commodityExchange, producer, amount);
        require(responseCode == 0, "Token transfer from Treasury to producer failed");

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
