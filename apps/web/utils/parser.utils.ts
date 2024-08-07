import {
	CommodityListing,
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
	ParticipantType,
} from "@/typings";
import { parseSmartContractDate } from "@/utils/date.utils";

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
