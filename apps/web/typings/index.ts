import { Point } from "geojson";

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
	locationType: PlaceType;
	centerLng: number;
	centerLat: number;
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
	createdAt: Date;
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
	totalPrice: number;
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
	price: number;
};

export type SerialNumberStatusChanged = BasePoolEvent & {
	id?: number;
	serialNumber: number;
	previousOwner: string;
	newOwner: string;
	status: string;
	createdAt: Date;
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

/* TIMELINE */

export type GroupedByDateTimeline = {
	dateGroup: string;
	events: TimelineEvent[];
};

export type ListingAddedEvent = {
	producer: Participant;
	createdAt: Date;
	quantity: number;
	commodityToken: CommodityToken;
};

export type CTFPurchaseEvent = {
	ctf: Participant;
	price: number;
	totalPrice: number;
};

export type TimelineEvent = {
	id?: number;
	type: "listing" | "purchase";
	createdAt: Date;
	commodityToken: CommodityToken;
	transaction: PoolTransaction;
} & ListingAddedEvent &
	CTFPurchaseEvent;

export type ParticipantUserView = {
	id: string; // EthAddress
	createdAt: string;
	name?: string;
	locations: Region[];
	type: ParticipantType;
};

/* MAPBOX TYPES */

export interface IGeocoderContext {
	id: string;
	wikidata: string;
	text: string;
}

export interface IGeocoderFeature {
	id: string;
	type: "Feature";
	place_type: Array<string>;
	relevance: number;
	properties: Object;
	address: string;
	text: string;
	place_name: string;
	bbox: [number, number, number, number];
	center: [number, number];
	geometry: Point;
	context: Array<IGeocoderContext>;
}

export interface IGeocoderResult {
	type: "FeatureCollection";
	query: Array<string | number>;
	features: Array<IGeocoderFeature>;
	attribution: string;
}

export interface IAddress {
	address?: string;
	postcode?: string;
	place?: string;
	locality?: string;
	country?: string;
	region?: string;
	disctrict?: string;
	neighborhood?: string;
	poi?: string;
}

/**
 * Various types of geographic features availabled in the Mapbox geocoder.
 *
 * @see https://docs.mapbox.com/api/search/#data-types
 */
export enum PlaceType {
	COUNTRY = "country",
	REGION = "region",
	POSTCODE = "postcode",
	DISTRICT = "district",
	PLACE = "place",
	LOCALITY = "locality",
	NEIGHBORHOOD = "neighborhood",
	ADDRESS = "address",
	POI = "poi",
}

export interface OwnerQuantity {
	ownerId: string;
	quantity: number;
}

export interface CommodityGroup {
	token: CommodityToken;
	quantity: number;
	label: string;
	country: string;
	owners: OwnerQuantity[];
}

export type CommodityPricePoint = {
	price: number;
	timestamp: Date;
};

export type TradeRoute = {
	ctfs: Participant[];
	destination: string;
};

export type BuyModuleArgs = {
	quantity: number;
	country?: Region;
	tradingRoute?: TradeRoute;
};
