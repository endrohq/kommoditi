// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../tokenService/IHederaTokenService.sol";
import "../HederaResponseCodes.sol";
import 'hardhat/console.sol';

contract TokenAuthority {

    address public commodityExchange;
    IHederaTokenService private tokenService;
    address public admin;
    mapping(address => bool) public approvedTokens;
    address[] public createdTokens;

    struct CommodityInfo {
        address tokenAddress;
        IHederaTokenService.TokenInfo tokenInfo;
    }

    uint64 private initialTotalSupply = 0;
    uint64 private maxSupply = 0;
    uint32 private decimals = 0;
    bool private freezeDefaultStatus = false;

    event TokenCreated(address indexed tokenAddress, string name, string symbol);
    event TokenApproved(address indexed tokenAddress);
    event TokenRevoked(address indexed tokenAddress);
    event TokenMinted(address indexed tokenAddress, address indexed producer, int64 amount);

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

    function createCommodity(string memory name, string memory symbol) external {

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

        createdTokens.push(tokenAddress);
        emit TokenCreated(tokenAddress, name, symbol);
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

        emit TokenMinted(tokenAddress, producer, amount);
        return responseCode;
    }

    function findCreatedTokenIndex(address tokenAddress) internal view returns (uint) {
        for (uint i = 0; i < createdTokens.length; i++) {
            if (createdTokens[i] == tokenAddress) {
                return i;
            }
        }
        return createdTokens.length; // Return length as indicator of not found
    }

    function approveToken(address tokenAddress) external onlyAdmin {
        require(findCreatedTokenIndex(tokenAddress) < createdTokens.length, "Token not created by this contract");
        approvedTokens[tokenAddress] = true;
        emit TokenApproved(tokenAddress);
    }

    function revokeToken(address tokenAddress) external onlyAdmin {
        require(findCreatedTokenIndex(tokenAddress) < createdTokens.length, "Token not created by this contract");
        approvedTokens[tokenAddress] = false;
        emit TokenRevoked(tokenAddress);
    }

    function isApprovedToken(address tokenAddress) external view returns (bool) {
        return approvedTokens[tokenAddress];
    }

    function transferToken(address tokenAddress, address from, address to, int64 amount) external {
        // require(approvedTokens[tokenAddress], "Token not approved for trading");
        int responseCode = tokenService.transferToken(tokenAddress, from, to, amount);
        require(responseCode == 0, "Token transfer failed");
    }

    function getTokenInfo(address tokenAddress) external view returns (IHederaTokenService.TokenInfo memory) {
        (int64 responseCode, IHederaTokenService.TokenInfo memory tokenInfo) = tokenService.getTokenInfo(tokenAddress);
        return tokenInfo;
    }

    function getCommodities() external view returns (CommodityInfo[] memory) {
        CommodityInfo[] memory allCommodities = new CommodityInfo[](createdTokens.length);

        for (uint i = 0; i < createdTokens.length; i++) {
            address tokenAddress = createdTokens[i];
            (int64 responseCode, IHederaTokenService.TokenInfo memory tokenInfo) = tokenService.getTokenInfo(tokenAddress);

            if (responseCode == HederaResponseCodes.SUCCESS || responseCode == HederaResponseCodes.OK) {
                allCommodities[i] = CommodityInfo(tokenAddress, tokenInfo);
            } else {
                // If there's an error, we'll return an empty TokenInfo struct
                allCommodities[i] = CommodityInfo(
                    tokenAddress,
                    IHederaTokenService.TokenInfo(
                        IHederaTokenService.HederaToken("", "", address(0), "", false, 0, false, IHederaTokenService.Expiry(0, address(0), 0)),
                        0, // totalSupply
                        true, // deleted
                        false, // defaultKycStatus
                        false // pauseStatus
                    )
                );
            }
        }

        return allCommodities;
    }



}
