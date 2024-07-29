import { Log } from "viem";

export type LocationItem = {
	address: string;
	lat: number;
	lng: number;
	h3Index?: string;
};

export type Producer = {
	name: string;
	location: string;
	h3Index?: string;
};

export type EthAddress = `0x${string}`;

export type Account = {
	address: EthAddress;
	balance?: string;
	producer?: Producer;
};

export type CommodityListingApproval = {
	approved: boolean;
	tokenAddress: string;
};

export type HederaToken = {
	totalSymbol: number;
	token: {
		name: string;
		symbol: string;
		treasury: EthAddress;
		memo: string;
		tokenSupplyType: boolean;
	};
	totalSupply: number;
	pauseStatus: boolean;
	defaultKycStatus: boolean;
	deleted: boolean;
};

export type GetCommodityResponse = {
	tokenInfo: HederaToken;
	tokenAddress: EthAddress;
};

export type GetAllPoolsResponse = {
	poolAddress: EthAddress;
	tokenAddress: EthAddress;
};

export type CommodityToken = HederaToken & {
	tokenAddress: EthAddress;
	poolAddress?: EthAddress;
};

export type PoolTransactionType =
	| "LiquidityAdded"
	| "LiquidityRemoved"
	| "trade"
	| "ListingAdded"
	| "ListingRemoved";

export type PoolTransaction = {
	type: PoolTransactionType;
	dateCreated: Date;
	transactionHash: EthAddress;
	from: EthAddress;
	to: EthAddress;
	value: string;
	blockNumber: bigint;
	blockHash: EthAddress;
};
