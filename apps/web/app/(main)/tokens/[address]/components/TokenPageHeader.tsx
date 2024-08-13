"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCommodityPrice } from "@/hooks/useCommodityPrice";
import { useTokenPage } from "@/providers/TokenPageProvider";
import React from "react";

export function TokenPageHeader() {
	const { commodity } = useTokenPage();
	const { currentPrice, priceIsLoading } = useCommodityPrice(
		commodity?.poolAddress,
	);

	if (!commodity) {
		return <></>;
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<div className="font-medium  flex items-center space-x-4 text-indigo-900">
					<div className="bg-gray-300 w-6 aspect-square rounded-full" />
					<span className="text-base font-bold">
						{commodity.name} ({commodity.symbol})
					</span>
				</div>
				{!priceIsLoading && (
					<div className="text-right">
						<div className="text-xs text-gray-600">Current Price per unit</div>
						<div className="text-base font-black text-black">
							{currentPrice} HBAR
						</div>
					</div>
				)}
			</div>
		</>
	);
}
