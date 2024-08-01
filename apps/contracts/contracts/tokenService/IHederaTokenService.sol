// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IHederaTokenService {
    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool tokenSupplyType;
        int64 maxSupply;
        bool freezeDefault;
        Expiry expiry;
    }

    struct Expiry {
        int64 second;
        address autoRenewAccount;
        int64 autoRenewPeriod;
    }

    struct TokenInfo {
        HederaToken token;
        int64 totalSupply;
        bool deleted;
        bool defaultKycStatus;
        bool pauseStatus;
    }

    function createNonFungibleToken(HederaToken memory token) external payable returns (int64 responseCode, address tokenAddress);

    function mintToken(address token, int64 amount, bytes[] memory metadata) external returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers);

    function transferNFT(address token, address sender, address receiver, int64 serialNumber) external returns (int64 responseCode);

    function associateToken(address account, address token) external returns (int64 responseCode);

    function getTokenInfo(address token) external returns (int64 responseCode, TokenInfo memory tokenInfo);

    function getNonFungibleTokenInfo(address token, int64 serialNumber) external returns (int64 responseCode, NonFungibleTokenInfo memory tokenInfo);

    struct NonFungibleTokenInfo {
        int64[] serialNumbers;
        bytes[] metadata;
    }
}
