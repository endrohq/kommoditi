// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../tokenService/IHederaTokenService.sol";
import "../HederaResponseCodes.sol";

contract TokenAuthority {

    struct CommodityInfo {
        address tokenAddress;
        IHederaTokenService.TokenInfo tokenInfo;
    }

    address public commodityExchange;
    IHederaTokenService private tokenService;
    address public admin;
    address[] public createdTokens;

    event TokenCreated(address indexed tokenAddress, string name, string symbol);
    event NFTMinted(address indexed tokenAddress, int64 serialNumber, address indexed owner);
    event NFTTransferred(address indexed tokenAddress, int64 serialNumber, address indexed from, address indexed to);

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

    function createToken(string memory name, string memory symbol) external onlyCommodityExchange returns (address) {
        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken({
            name: name,
            symbol: symbol,
            treasury: address(this),
            memo: string(abi.encodePacked("Commodity Token for ", symbol)),
            tokenSupplyType: false, // NFTs have a finite supply
            maxSupply: 0, // No max supply for our use case
            freezeDefault: false,
            expiry: IHederaTokenService.Expiry(0, address(0), 0) // No expiry
        });

        (int64 responseCode, address tokenAddress) = tokenService.createNonFungibleToken(token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Token creation failed");

        createdTokens.push(tokenAddress);
        emit TokenCreated(tokenAddress, name, symbol);

        return tokenAddress;
    }

    function mintNFT(address tokenAddress, address receiver, int64 quantity) external onlyCommodityExchange returns (int64[] memory) {
        require(quantity > 0, "Quantity must be positive");

        bytes[] memory metadataArray = new bytes[](uint64(quantity));
        // You can add metadata for each NFT here if needed

        (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers) = tokenService.mintToken(tokenAddress, quantity, metadataArray);
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT minting failed");

        // Associate token with receiver
        _associateToken(receiver, tokenAddress);

        // Transfer the newly minted NFTs to the receiver
        for (uint64 i = 0; i < uint64(quantity); i++) {
            responseCode = tokenService.transferNFT(tokenAddress, address(this), receiver, serialNumbers[i]);
            require(responseCode == HederaResponseCodes.SUCCESS, "NFT transfer failed");
            emit NFTMinted(tokenAddress, serialNumbers[i], receiver);
        }

        return serialNumbers;
    }

    function transferNFT(address tokenAddress, address from, address to, int64 serialNumber) external {
        // Associate token with receiver
        _associateToken(to, tokenAddress);

        int64 responseCode = tokenService.transferNFT(tokenAddress, from, to, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "NFT transfer failed");

        emit NFTTransferred(tokenAddress, serialNumber, from, to);
    }

    function _associateToken(address account, address tokenAddress) internal {
        int64 responseCode = tokenService.associateToken(account, tokenAddress);
        require(
            responseCode == HederaResponseCodes.SUCCESS ||
            responseCode == HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT,
            "Token association failed"
        );
    }

    function getTokenInfo(address tokenAddress) external  returns (IHederaTokenService.TokenInfo memory) {
        (int64 responseCode, IHederaTokenService.TokenInfo memory tokenInfo) = tokenService.getTokenInfo(tokenAddress);
        require(responseCode == HederaResponseCodes.SUCCESS, "Failed to get token info");
        return tokenInfo;
    }

    function getNonFungibleTokenInfo(address tokenAddress, int64 serialNumber) external returns (IHederaTokenService.NonFungibleTokenInfo memory) {
        (int64 responseCode, IHederaTokenService.NonFungibleTokenInfo memory tokenInfo) = tokenService.getNonFungibleTokenInfo(tokenAddress, serialNumber);
        require(responseCode == HederaResponseCodes.SUCCESS, "Failed to get NFT info");
        return tokenInfo;
    }

}
