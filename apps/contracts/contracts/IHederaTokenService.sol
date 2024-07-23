// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
pragma experimental ABIEncoderV2;

interface IHederaTokenService {
    struct Expiry {
        uint32 second;
        uint32 autoRenewPeriod;
    }

    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool supplyType;
        uint32 maxSupply;
        bool freezeDefault;
        Expiry expiry;
    }

    struct TokenKey {
        uint256 keyType;
        bytes key;
    }

    function createFungibleToken(
        HederaToken memory token,
        uint64 initialTotalSupply,
        uint32 decimals,
        TokenKey[] memory keys
    ) external payable returns (int64 responseCode, address tokenAddress);

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external returns (int64 responseCode, uint64 newTotalSupply, int64[] memory serialNumbers);

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int64 responseCode);

    function transferNFT(
        address token,
        address sender,
        address recipient,
        int64 serialNumber
    ) external returns (int64 responseCode);

    function associateToken(
        address account,
        address token
    ) external returns (int64 responseCode);
}
