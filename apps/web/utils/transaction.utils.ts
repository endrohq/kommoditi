import { CommodityPoolLiquidity, PoolTransactionType } from "@/typings";
import { parseSmToNumberFormat } from "@/utils/number.utils";
import { formatEther } from "viem";

export function formatTransactionType(type: PoolTransactionType) {
	switch (type) {
		case "LiquidityAdded":
			return "Liquidity Added";
		case "LiquidityRemoved":
			return "Liquidity Removed";
		case "ListingAdded":
			return "Listing Added";
		case "ListingRemoved":
			return "Listing Removed";
		case "trade":
			return "Trade";
		default:
			return type;
	}
}

export function formatLpLiquidities(
	liquidityData: any[],
): CommodityPoolLiquidity[] {
	return liquidityData?.map((item) => ({
		ctf: item.ctf,
		minPrice: parseSmToNumberFormat(Number(item.minPrice)),
		maxPrice: parseSmToNumberFormat(Number(item.maxPrice)),
		amount: Number(formatEther(item.amount)),
	}));
}
