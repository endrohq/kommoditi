import { CurrentPrice } from "@/app/tokens/[address]/components/CurrentPrice";
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
			<Breadcrumbs
				crumbs={[
					{ label: "Commodities" },
					{
						label: commodity.token.name,
					},
				]}
			/>
			<div className="mt-2 flex items-center justify-between">
				<div className="font-medium  flex items-center space-x-4 text-indigo-900">
					<div className="bg-gray-300 w-8 aspect-square rounded-full" />
					<span className="text-xl font-bold">
						{commodity.token.name} ({commodity.token.symbol})
					</span>
				</div>
				{!priceIsLoading && (
					<div className="text-right">
						<div className="text-xs text-gray-600">Current Price per unit</div>
						<div className="text-2xl font-black text-black">
							{currentPrice} HBAR
						</div>
					</div>
				)}
			</div>
		</>
	);
}
