import { Region } from "@/typings/index";

interface CommodityLiquidity {
	id: number /* primary key */;
	created_at: string;
	amount?: any; // type unknown;
	minPrice?: any; // type unknown;
	maxPrice?: any; // type unknown;
	ctf?: string;
	isAdding?: boolean;
}

interface Location {
	id: string /* primary key */;
	createdAt: string;
	name?: string;
}

interface H3Index {
	h3Index: string /* primary key */;
	locationId?: string /* foreign key to location.id */;
	location?: Location;
}

interface Blockchain {
	id: number /* primary key */;
	createdAt: string;
	blockNumber: any; // type unknown;
}

interface Transaction {
	id: string /* primary key */;
	createdAt: string;
	chainId?: number /* foreign key to blockchain.id */;
	from?: string;
	to?: string;
	value?: any; // type unknown;
	blockNumber?: any; // type unknown;
	blockchain?: Blockchain;
}

interface CommodityToken {
	createdAt: string;
	name?: string;
	tokenAddress: string /* primary key */;
	poolAddress?: string;
	symbol?: string;
	treasury?: string;
	totalSupply?: any; // type unknown;
	maxSupply?: any; // type unknown;
	chainId?: number /* foreign key to blockchain.id */;
	blockchain?: Blockchain;
}

interface Participant {
	id: string /* primary key */;
	createdAt: string;
	name?: string;
	overheadPercentage?: any; // type unknown;
	type: any; // type unknown;
	chainId?: number /* foreign key to blockchain.id */;
	blockchain?: Blockchain;
}

interface Participant_location {
	locationId: string /* primary key */ /* foreign key to location.id */;
	participantId: string /* foreign key to participant.id */;
	location?: Location;
	participant?: Participant;
}

interface Listing {
	id: number /* primary key */;
	createdAt: string;
	producerId?: string /* foreign key to participant.id */;
	transactionHash?: string /* foreign key to transaction.id */;
	tokenAddress?: string /* foreign key to commodityToken.tokenAddress */;
	participant?: Participant;
	transaction?: Transaction;
	commodityToken?: CommodityToken;
}

interface Commodity {
	id: any; // type unknown   /* primary key */;
	tokenAddress: string /* foreign key to commodityToken.tokenAddress */;
	producerId?: string /* foreign key to participant.id */;
	listingId?: number /* foreign key to listing.id */;
	currentOwnerId?: string /* foreign key to participant.id */;
	status?: string;
	commodityToken?: CommodityToken;
	participant?: Participant;
	listing?: Listing;
}

interface CtfPurchase {
	id: number /* primary key */;
	createdAt: string;
	tokenAddress?: string /* foreign key to commodityToken.tokenAddress */;
	transactionHash?: string /* foreign key to transaction.id */;
	ctf?: string /* foreign key to participant.id */;
	listingId?: number /* foreign key to listing.id */;
	price: any; // type unknown;
	totalPrice: any; // type unknown;
	commodityToken?: CommodityToken;
	transaction?: Transaction;
	participant?: Participant;
	listing?: Listing;
}
