import { PoolTransactionType } from "@/typings";

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
