// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
pragma experimental ABIEncoderV2;

interface IHederaTokenService {
        /// Expiry properties of a Hedera token - second, autoRenewAccount, autoRenewPeriod
        struct Expiry {
        // The epoch second at which the token should expire; if an auto-renew account and period are
        // specified, this is coerced to the current epoch second plus the autoRenewPeriod
        int64 second;

        // ID of an account which will be automatically charged to renew the token's expiration, at
        // autoRenewPeriod interval, expressed as a solidity address
        address autoRenewAccount;

        // The interval at which the auto-renew account will be charged to extend the token's expiry
        int64 autoRenewPeriod;
    }

    struct KeyValue {

        // if set to true, the key of the calling Hedera account will be inherited as the token key
        bool inheritAccountKey;

        // smart contract instance that is authorized as if it had signed with a key
        address contractId;

        // Ed25519 public key bytes
        bytes ed25519;

        // Compressed ECDSA(secp256k1) public key bytes
        bytes ECDSA_secp256k1;

        // A smart contract that, if the recipient of the active message frame, should be treated
        // as having signed. (Note this does not mean the <i>code being executed in the frame</i>
        // will belong to the given contract, since it could be running another contract's code via
        // <tt>delegatecall</tt>. So setting this key is a more permissive version of setting the
        // contractID key, which also requires the code in the active message frame belong to the
        // the contract with the given id.)
        address delegatableContractId;
    }

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

    struct TokenKey {
        uint256 keyType;
        bytes key;
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

    // getTokenBalance
    function getTokenBalance(address token, address account) external view returns (uint64 balance);
}
