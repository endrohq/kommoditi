import { PoolTransactionType } from "@/typings";

export function formatTransactionType(type: PoolTransactionType) {
	switch (type) {
		case "liquidity-added":
			return "Liquidity Added";
		case "liquidity-removed":
			return "Liquidity Removed";
		case "listing-added":
			return "Listing Added";
		case "listing-removed":
			return "Listing Removed";
		case "trade":
			return "Trade";
		default:
			return type;
	}
}
