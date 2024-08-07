import { Log } from "viem";

export type LocationItem = {
	address: string;
	lat: number;
	lng: number;
	h3Index?: string;
};

export enum ParticipantType {
	PRODUCER = "PRODUCER",
	CTF = "CTF",
	CONSUMER = "CONSUMER",
}

export type Participant = {
	id: string;
	name: string;
	type: ParticipantType;
	overheadPercentage: number;
	locations: Region[];
};

export type EthAddress = `0x${string}`;

export type AccountBase = {
	address: EthAddress;
	balance?: string;
};

export type Account = AccountBase & Participant;

export type CommodityListing = {
	producer: EthAddress;
	active: boolean;
	serialNumbers: number[];
	dateOffered: Date;
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
		maxSupply: number;
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

export type CommodityToken = {
	name: string;
	symbol: string;
	treasury: EthAddress;
	maxSupply: number;
	tokenAddress: EthAddress;
	poolAddress?: EthAddress;
	totalSupply: number;
	pauseStatus?: boolean;
	defaultKycStatus?: boolean;
	deleted?: boolean;
	chainId: number;
};

export type PoolTransactionType =
	| "LiquidityChanged"
	| "CTFPurchase"
	| "CommodityPurchased"
	| "PriceUpdated"
	| "SerialNumberStatusChanged"
	| "ListingAdded"
	| "ListingSold";

export const poolTransactionTypes: PoolTransactionType[] = [
	"ListingAdded",
	"ListingSold",
	"LiquidityChanged",
	"CTFPurchase",
	"CommodityPurchased",
	"PriceUpdated",
];

export type PoolTransaction = {
	id: EthAddress;
	createdAt: Date;
	from: EthAddress;
	to: EthAddress;
	value: string;
	blockNumber: number;
	blockHash: EthAddress;
	events: Array<{
		type: string;
		logArgs: any;
	}>;
};

export interface CommodityPoolLiquidity {
	ctf: string;
	minPrice: number;
	maxPrice: number;
	amount: number;
}

export type Region = {
	id: string;
	name: string;
	h3Indexes: string[];
};

export type MapBoxViewState = {
	longitude: number;
	latitude: number;
	zoom: number;
};

export interface BlockchainConfig {
	id: number;
	blockNumber: number;
}
