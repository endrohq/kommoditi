import {
	CTFPurchased,
	CommodityListing,
	CommodityToken,
	ConsumerPurchased,
	GetAllPoolsResponse,
	GetCommodityResponse,
	LiquidityChanged,
	ListingAdded,
	ParticipantType,
	PoolEvent,
	PriceUpdated,
} from "@/typings";
import { parseSmartContractDate } from "@/utils/date.utils";
import { parseSmToNumberFormat } from "@/utils/number.utils";

export function parseCommodity(
	commodity: GetCommodityResponse,
	pools: GetAllPoolsResponse[] = [],
	chainId: number,
): CommodityToken {
	const token = commodity.tokenInfo || ({} as CommodityToken);
	return {
		totalSupply: Number(commodity.tokenInfo.totalSupply),
		name: token.token.name,
		symbol: token.token.symbol,
		treasury: token.token.treasury,
		maxSupply: 0,
		tokenAddress: commodity.tokenAddress,
		poolAddress: pools.find(
			(pool) => pool.tokenAddress === commodity.tokenAddress,
		)?.poolAddress,
		chainId,
	};
}

export function parseCommodities(
	commodities: GetCommodityResponse[],
	pools: GetAllPoolsResponse[],
	chainId: number,
) {
	return (commodities || [])?.map((commodity) =>
		parseCommodity(commodity, pools, chainId),
	);
}

export function parseListings(listingsData: Record<string, any>[]) {
	return listingsData?.map(
		(listing) =>
			({
				dateOffered: parseSmartContractDate(listing.dateOffered),
				producer: listing.producer,
				serialNumbers: listing.serialNumbers.map((i: bigint) => Number(i)),
				active: listing.active,
			}) as CommodityListing,
	);
}

export function participantTypeToSmParticipantType(type: ParticipantType) {
	switch (type) {
		case ParticipantType.PRODUCER:
			return 0;
		case ParticipantType.CTF:
			return 1;
		case ParticipantType.CONSUMER:
			return 2;
	}
}

export function smParticipantTypeToParticipantType(type: number) {
	switch (type) {
		case 0:
			return ParticipantType.PRODUCER;
		case 1:
			return ParticipantType.CTF;
		case 2:
			return ParticipantType.CONSUMER;
	}
}

export function parseSmCommodityPoolEvent(
	log: Record<string, any>,
	token?: CommodityToken,
): PoolEvent {
	const event = log.args;
	const baseEvent = {
		type: log.eventName,
		tokenAddress: token?.tokenAddress,
		transactionHash: log.transactionHash,
		createdAt: parseSmartContractDate(event.timestamp),
	};

	switch (baseEvent.type) {
		case "ListingAdded":
			return {
				...baseEvent,
				listingId: Number(event.listingId),
				producerId: event.producerId,
				serialNumbers: event.serialNumbers.map((sn: any) => Number(sn)),
			} as ListingAdded;

		case "LiquidityChanged":
			return {
				...baseEvent,
				ctf: event.ctf,
				amount: parseSmToNumberFormat(Number(event.amount)),
				minPrice: parseSmToNumberFormat(Number(event.minPrice)),
				maxPrice: parseSmToNumberFormat(Number(event.maxPrice)),
				isAdding: event.isAdding,
			} as LiquidityChanged;

		case "CTFPurchased":
			return {
				...baseEvent,
				ctfId: event.to,
				producerId: event.from,
				listingId: Number(event.listingId),
				serialNumbers: event.serialNumbers.map((sn: any) => Number(sn)),
				price: parseSmToNumberFormat(Number(event.price)),
				totalPrice: parseSmToNumberFormat(Number(event.totalPrice)),
			} as CTFPurchased;

		case "ConsumerPurchased":
			return {
				...baseEvent,
				consumerId: event.to,
				ctfId: event.from,
				serialNumbers: event.serialNumbers.map((sn: any) => Number(sn)),
				price: parseSmToNumberFormat(Number(event.price)),
				totalPrice: parseSmToNumberFormat(Number(event.totalPrice)),
			} as ConsumerPurchased;

		case "PriceUpdated":
			return {
				...baseEvent,
				price: parseSmToNumberFormat(Number(event.newPrice)),
				tokenAddress: token?.tokenAddress,
			} as PriceUpdated;
		default:
			throw new Error(`Unsupported event type: ${baseEvent.type}`);
	}
}
