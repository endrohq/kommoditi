"use client";

import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { EnhancedCommodity } from "@/typings";
import { getDistanceForDate } from "@/utils/date.utils";
import { getTokenPage } from "@/utils/route.utils";
import Link from "next/link";
import { useState } from "react";

interface ItemForPurchaseProps {
	item: EnhancedCommodity;
}

export function ItemForPurchase({ item }: ItemForPurchaseProps) {
	/*const [isPurchasing, setIsPurchasing] = useState(false);

	const { writeToContract } = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "purchaseCommodityFromCTF",
		eventName: "CommodityPurchased",
	});
*/

	return (
		<Link
			href={getTokenPage(item.token.tokenAddress)}
			className="bg-gray-50 group hover:bg-indigo-50 transition-all p-1 rounded overflow-hidden"
		>
			<div className="bg-gray-200 group-hover:bg-indigo-100 rounded-t-sm rounded-b flex items-center justify-center py-12">
				<span className="text-3xl text-gray-300 group-hover:text-indigo-200 font-bold">
					{item?.token?.symbol}
				</span>
			</div>
			<div className="py-4 px-4">
				<div className="font-bold text-lg w-11/12">{item.label}</div>
				<div className="text-xs text-gray-500 gap-1 flex items-center">
					<span>
						{item.producers?.size} producer{item.producers?.size > 1 && "s"}
					</span>
					<span>•</span>
					<span>{item.quantity}T available</span>
				</div>
			</div>
		</Link>
	);
}
