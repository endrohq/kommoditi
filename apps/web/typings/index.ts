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

export type BasePoolEvent = {
	tokenAddress?: EthAddress;
	type?: string;
	transactionHash: string;
};

export type ListingAdded = BasePoolEvent & {
	id?: number;
	listingId: number;
	producer: string;
	serialNumbers: number[];
	timestamp: Date;
};

export type ListingSold = BasePoolEvent & {
	id?: number;
	listingId: number;
	buyer: string;
	serialNumber: number;
	price: number;
	timestamp: Date;
};

export type LiquidityChanged = BasePoolEvent & {
	id?: number;
	ctf: string;
	amount: number;
	minPrice: number;
	maxPrice: number;
	isAdding: boolean;
};

export type CTFPurchase = BasePoolEvent & {
	id?: number;
	ctf: string;
	listingId: number;
	producer: string;
	serialNumbers: number[];
	price: number;
};

export type CommodityPurchased = BasePoolEvent & {
	id?: number;
	buyer: string;
	ctf: string;
	serialNumbers: number[];
	quantity: number;
	basePrice: number;
	ctfFee: string;
};

export type PriceUpdated = BasePoolEvent & {
	id?: number;
	newPrice: number;
};

export type SerialNumberStatusChanged = BasePoolEvent & {
	id?: number;
	serialNumber: number;
	previousOwner: string;
	newOwner: string;
	status: string;
	timestamp: Date;
};

export type PoolEvent =
	| ListingAdded
	| ListingSold
	| LiquidityChanged
	| CTFPurchase
	| CommodityPurchased
	| PriceUpdated
	| SerialNumberStatusChanged;

export type PoolTransaction = {
	id: EthAddress;
	createdAt: Date;
	from: EthAddress;
	to: EthAddress;
	value: string;
	blockNumber: number;
	events?: PoolEvent[];
};
