import {
	CommodityListing,
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
} from "@/typings";
import { parseSmartContractDate } from "@/utils/date.utils";

export function parseCommodity(
	commodity: GetCommodityResponse,
	pools: GetAllPoolsResponse[] = [],
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
	};
}

export function parseCommodities(
	commodities: GetCommodityResponse[],
	pools: GetAllPoolsResponse[],
) {
	return (commodities || [])?.map((commodity) =>
		parseCommodity(commodity, pools),
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
