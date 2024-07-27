import { GetAllPoolsResponse, GetCommodityResponse } from "@/typings";

export function parseCommodity(
	commodity: GetCommodityResponse,
	pools: GetAllPoolsResponse[] = [],
) {
	return {
		...commodity.tokenInfo,
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
