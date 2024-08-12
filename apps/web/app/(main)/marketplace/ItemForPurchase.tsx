"use client";

import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { EnhancedCommodity } from "@/typings";
import { useState } from "react";

interface ItemForPurchaseProps {
	item: EnhancedCommodity;
}

export function ItemForPurchase({ item }: ItemForPurchaseProps) {
	const [isPurchasing, setIsPurchasing] = useState(false);

	const { writeToContract } = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "purchaseCommodityFromCTF",
		eventName: "CommodityPurchased",
	});

	return (
		<div
			onClick={() =>
				writeToContract([
					item.tokenAddress,
					item.ctf,
					BigInt(item.quantity - 1),
				])
			}
			className="bg-gray-50 rounded overflow-hidden"
		>
			<div className="bg-gray-200 flex items-center justify-center py-14">
				<CommodityAvatar />
			</div>
			<div className="py-6 px-6">
				<div className="font-bold text-sm w-11/12">{item.label}</div>
				<div className="text-xs text-gray-500 gap-1 mt-1 flex items-center">
					<span>Quantity: {item.quantity}</span>
					<span>•</span>
				</div>
			</div>
		</div>
	);
}
