// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IHederaTokenService.sol";
import "../HederaResponseCodes.sol";
import 'hardhat/console.sol';

contract MockHederaTokenService is IHederaTokenService {
    mapping(address => HederaToken) public tokens;
    mapping(address => int64) public tokenSupply;
    mapping(address => mapping(address => int64)) public tokenBalances;
    mapping(address => mapping(address => bool)) public tokenAssociations;
    mapping(address => TokenInfo) public tokenInfos;
    mapping(address => mapping(int64 => bool)) public nftMinted;
    mapping(address => int64) private nftSerialNumber;

    uint256 private tokenCounter;

    constructor() {
        tokenCounter = 0;
    }

    function createNonFungibleToken(HederaToken memory token) external payable override returns (int64 responseCode, address tokenAddress) {
        tokenCounter++;
        tokenAddress = address(uint160(tokenCounter));
        tokens[tokenAddress] = token;
        nftSerialNumber[tokenAddress] = 0;

        TokenInfo memory newTokenInfo = TokenInfo({
            token: token,
            totalSupply: 0,
            deleted: false,
            defaultKycStatus: false,
            pauseStatus: false
        });
        tokenInfos[tokenAddress] = newTokenInfo;

        return (HederaResponseCodes.SUCCESS, tokenAddress);
    }

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external override returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers) {
        require(amount > 0, "Amount must be positive");

        if (tokens[token].tokenSupplyType) { // Fungible token
            tokenSupply[token] += amount;
            tokenBalances[token][tokens[token].treasury] += amount;
            newTotalSupply = tokenSupply[token];
            tokenInfos[token].totalSupply = newTotalSupply;
            return (HederaResponseCodes.SUCCESS, newTotalSupply, new int64[](0));
        } else { // Non-fungible token
            serialNumbers = new int64[](uint64(amount));
            for (int64 i = 0; i < amount; i++) {
                nftSerialNumber[token]++;
                int64 newSerialNumber = nftSerialNumber[token];
                serialNumbers[uint64(i)] = newSerialNumber;
                nftMinted[token][newSerialNumber] = true;
                tokenBalances[token][tokens[token].treasury]++; // Increment balance for treasury
            }
            tokenInfos[token].totalSupply += amount;
            newTotalSupply = tokenInfos[token].totalSupply;
            return (HederaResponseCodes.SUCCESS, newTotalSupply, serialNumbers);
        }
    }

    function transferNFT(
        address token,
        address sender,
        address receiver,
        int64 serialNumber
    ) external override returns (int64 responseCode) {
        require(nftMinted[token][serialNumber], "NFT does not exist");
        require(tokenBalances[token][sender] > 0, "Sender does not own this NFT");
        require(tokenAssociations[receiver][token], "Receiver is not associated with this token");
        tokenBalances[token][sender]--;
        tokenBalances[token][receiver]++;
        return HederaResponseCodes.SUCCESS;
    }

    function associateToken(
        address account,
        address token
    ) external override returns (int64 responseCode) {
        if (tokenAssociations[account][token]) {
            // This could be changed based on actual observed behavior
            return HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT;
        }
        tokenAssociations[account][token] = true;
        return HederaResponseCodes.SUCCESS;
    }

    function getTokenInfo(address token) external view override returns (int64 responseCode, TokenInfo memory tokenInfo) {
        require(address(tokens[token].treasury) != address(0), "Token does not exist");
        return (HederaResponseCodes.SUCCESS, tokenInfos[token]);
    }

    function getNonFungibleTokenInfo(address token, int64 serialNumber) external view override returns (int64 responseCode, NonFungibleTokenInfo memory tokenInfo) {
        require(address(tokens[token].treasury) != address(0), "Token does not exist");
        require(nftMinted[token][serialNumber], "NFT does not exist");

        int64[] memory serialNumbers = new int64[](1);
        serialNumbers[0] = serialNumber;

        bytes[] memory metadata = new bytes[](1);
        metadata[0] = abi.encodePacked("Metadata for NFT ", serialNumber);

        NonFungibleTokenInfo memory nftInfo = NonFungibleTokenInfo({
            serialNumbers: serialNumbers,
            metadata: metadata
        });

        return (HederaResponseCodes.SUCCESS, nftInfo);
    }
}
