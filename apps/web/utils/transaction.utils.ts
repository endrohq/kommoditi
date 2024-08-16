import { CommodityPoolLiquidity } from "@/typings";
import { parseSmToNumberFormat } from "@/utils/number.utils";
import { formatEther } from "viem";

export function formatLpLiquidities(
	liquidityData: any[],
): CommodityPoolLiquidity[] {
	return liquidityData?.map((item) => ({
		distributor: item.distributor,
		minPrice: parseSmToNumberFormat(Number(item.minPrice)),
		maxPrice: parseSmToNumberFormat(Number(item.maxPrice)),
		amount: Number(formatEther(item.amount)),
	}));
}
