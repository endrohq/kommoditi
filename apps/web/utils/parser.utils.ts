import {
	CommodityListing,
	CommodityToken,
	ConsumerPurchased,
	DistributorPurchased,
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
		case ParticipantType.DISTRIBUTOR:
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
			return ParticipantType.DISTRIBUTOR;
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
		tokenAddress: token?.tokenAddress?.toLowerCase(),
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
				distributor: event.distributor,
				amount: parseSmToNumberFormat(Number(event.amount)),
				minPrice: parseSmToNumberFormat(Number(event.minPrice)),
				maxPrice: parseSmToNumberFormat(Number(event.maxPrice)),
				isAdding: event.isAdding,
			} as LiquidityChanged;

		case "DistributorPurchased":
			return {
				...baseEvent,
				distributorId: event.to,
				producerId: event.from,
				listingId: Number(event.listingId),
				serialNumbers: event.serialNumbers.map((sn: any) => Number(sn)),
				price: parseSmToNumberFormat(Number(event.price)),
				totalPrice: parseSmToNumberFormat(Number(event.totalPrice)),
			} as DistributorPurchased;

		case "ConsumerPurchased":
			return {
				...baseEvent,
				consumerId: event.to,
				distributorId: event.from,
				serialNumbers: event.serialNumbers.map((sn: any) => Number(sn)),
				price: parseSmToNumberFormat(Number(event.price)),
				totalPrice: parseSmToNumberFormat(Number(event.totalPrice)),
			} as ConsumerPurchased;

		case "PriceUpdated":
			return {
				...baseEvent,
				price: parseSmToNumberFormat(Number(event.newPrice)),
			} as PriceUpdated;
		default:
			throw new Error(`Unsupported event type: ${baseEvent.type}`);
	}
}
