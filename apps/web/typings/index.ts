import { Point } from "geojson";

export type ContractName =
	| "participantRegistry"
	| "commodityExchange"
	| "tokenAuthority"
	| "commodityFactory"
	| "commodityPool";

export enum ParticipantType {
	PRODUCER = "PRODUCER",
	DISTRIBUTOR = "DISTRIBUTOR",
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
	| "DistributorPurchased"
	| "ConsumerPurchased"
	| "PriceUpdated"
	| "ListingAdded"
	| "ListingSold";

export const poolTransactionTypes: PoolTransactionType[] = [
	"ListingAdded",
	"ListingSold",
	"LiquidityChanged",
	"DistributorPurchased",
	"ConsumerPurchased",
	"PriceUpdated",
];

export enum CommodityStatus {
	LISTED = "LISTED",
	PURCHASED_BY_DISTRIBUTOR = "PURCHASED_BY_DISTRIBUTOR",
	PURCHASED_BY_CONSUMER = "PURCHASED_BY_CONSUMER",
}

export interface CommodityPoolLiquidity {
	distributor: string;
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
	id?: number;
	tokenAddress: EthAddress;
	type: PoolTransactionType;
	createdAt: Date;
	transactionHash: string;
};

export type ListingAdded = BasePoolEvent & {
	listingId: number;
	producerId: string;
	serialNumbers: number[];
};

export type ListingSold = BasePoolEvent & {
	listingId: number;
	buyer: string;
	serialNumber: number;
	price: number;
	timestamp: Date;
};

export type LiquidityChanged = BasePoolEvent & {
	distributor: string;
	amount: number;
	minPrice: number;
	maxPrice: number;
	isAdding: boolean;
};

export type DistributorPurchased = BasePoolEvent & {
	distributorId: string;
	listingId: number;
	producerId: string;
	serialNumbers: number[];
	price: number;
	totalPrice: number;
};

export type ConsumerPurchased = BasePoolEvent & {
	consumerId: string;
	distributorId: string;
	serialNumbers: number[];
	price: number;
	totalPrice: number;
};

export type PriceUpdated = BasePoolEvent & {
	price: number;
};

export type PoolEvent =
	| ListingAdded
	| ListingSold
	| LiquidityChanged
	| DistributorPurchased
	| ConsumerPurchased
	| PriceUpdated;

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

export type DistributorPurchaseEvent = {
	distributor: Participant;
	price: number;
	totalPrice: number;
};

export type ConsumerPurchaseEvent = {
	consumer: Participant;
	price: number;
	totalPrice: number;
};

export type TimelineEvent = {
	id?: number;
	type:
		| "listing"
		| "liquidity"
		| "consumerPurchase"
		| "distributorPurchase"
		| "commodityTransfer";
	createdAt: Date;
	commodityToken: CommodityToken;
	transaction: PoolTransaction;
} & ListingAddedEvent &
	DistributorPurchaseEvent &
	ConsumerPurchaseEvent;

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

export type ParticipantQuantity = {
	partner: Participant;
	quantity: number;
	listingIds?: number[];
};

export interface CommodityGroup {
	token: CommodityToken;
	quantity: number;
	label: string;
	country: string;
	owners: OwnerQuantity[];
}

export type CommodityPricePoint = {
	price: number | null;
	timestamp: string;
};

export type TradeRoute = {
	options: ParticipantQuantity[];
	destination: string;
};

export type BuyModuleArgs = {
	quantity: number;
	country?: Region;
	tradingRoute?: TradeRoute;
};

export type CommodityPurchasePrice = {
	basePrice: number;
	overheadFee: number;
	subtotal: number;
	serviceFee: number;
	buffer: number;
	totalPrice: number;
};

export interface ParticipantProfileToken {
	token: CommodityToken;
	amount: number;
}

export interface ParticipantProfile {
	account: Participant;
	tokens: ParticipantProfileToken[];
}
