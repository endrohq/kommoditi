// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IHederaTokenService {
    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool tokenSupplyType;
        uint32 maxSupply;
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
        // Add other fields as necessary
    }

    function createFungibleToken(
        HederaToken memory token,
        uint64 initialTotalSupply,
        uint32 decimals
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

    function associateToken(
        address account,
        address token
    ) external returns (int64 responseCode);

    function getTokenInfo(address token) external view returns (int64 responseCode, TokenInfo memory tokenInfo);
}
