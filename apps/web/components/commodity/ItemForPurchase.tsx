"use client";

import { CommodityGroup } from "@/typings";
import { getTokenPage } from "@/utils/route.utils";
import Link from "next/link";

interface ItemForPurchaseProps {
	item: CommodityGroup;
}

export function ItemForPurchase({ item }: ItemForPurchaseProps) {
	return (
		<Link
			href={`${getTokenPage(item.token.tokenAddress)}?country=${item.country}`}
			className="group transition-colors rounded overflow-hidden"
		>
			<div className="bg-gray-100 group-hover:bg-indigo-100 rounded-t-sm rounded-b flex items-center justify-center w-full py-12">
				<span className="text-3xl text-gray-300 group-hover:text-indigo-200 font-bold">
					{item?.token?.symbol}
				</span>
			</div>
			<div className="py-4">
				<div className="font-bold group-hover:text-blue-700 text-lg w-11/12">
					{item.label}
				</div>
				<div className="text-xs text-gray-500 gap-1 flex items-center">
					<span>
						{item.owners?.length} producer{item.owners?.length > 1 && "s"}
					</span>
					<span>•</span>
					<span>{item.quantity}T available</span>
				</div>
			</div>
		</Link>
	);
}
