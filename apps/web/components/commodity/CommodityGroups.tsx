import { fetchCommoditiesGroupedByCountry } from "@/app/actions";
import { ItemForPurchase } from "@/components/commodity/ItemForPurchase";
import React from "react";

type CommodityGroupsProps = {
	tokenAddress?: string;
	address?: string;
};

export async function CommodityGroups(props: CommodityGroupsProps) {
	const activeCommoditiesByRegion =
		await fetchCommoditiesGroupedByCountry(props);

	return (
		<div className="grid grid-cols-3 gap-2">
			{activeCommoditiesByRegion?.map((item) => (
				<ItemForPurchase item={item} />
			))}
		</div>
	);
}
