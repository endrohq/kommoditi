// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IHederaTokenService.sol";

contract MockHederaTokenService is IHederaTokenService {
    mapping(address => HederaToken) public tokens;
    mapping(address => uint64) public tokenSupply;
    mapping(address => mapping(address => uint64)) public tokenBalances;
    mapping(address => mapping(address => bool)) public tokenAssociations;

    uint256 private tokenCounter;

    constructor() {
        tokenCounter = 0;
    }

    function createFungibleToken(
        HederaToken memory token,
        uint64 initialTotalSupply,
        uint32 decimals,
        TokenKey[] memory keys
    ) external payable override returns (int64 responseCode, address tokenAddress) {
        tokenCounter++;
        tokenAddress = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenCounter)))));
        tokens[tokenAddress] = token;
        tokenSupply[tokenAddress] = initialTotalSupply;
        tokenBalances[tokenAddress][token.treasury] = initialTotalSupply;
        return (0, tokenAddress); // 0 indicates success
    }

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external override returns (int64 responseCode, uint64 newTotalSupply, int64[] memory serialNumbers) {
        require(amount > 0, "Amount must be positive");
        tokenSupply[token] += uint64(amount);
        tokenBalances[token][tokens[token].treasury] += uint64(amount);
        newTotalSupply = tokenSupply[token];
        return (0, newTotalSupply, new int64[](0)); // 0 indicates success
    }

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external override returns (int64 responseCode) {
        require(amount > 0, "Amount must be positive");
        require(tokenBalances[token][sender] >= uint64(amount), "Insufficient balance");
        tokenBalances[token][sender] -= uint64(amount);
        tokenBalances[token][recipient] += uint64(amount);
        return 0; // 0 indicates success
    }

    function transferNFT(
        address token,
        address sender,
        address recipient,
        int64 serialNumber
    ) external override returns (int64 responseCode) {
        // This is a mock, so we don't actually implement NFT logic
        return 0; // 0 indicates success
    }

    function associateToken(
        address account,
        address token
    ) external override returns (int64 responseCode) {
        tokenAssociations[account][token] = true;
        return 0; // 0 indicates success
    }
}
