import { loadCommodities } from "@/app/(main)/actions";
import { CreateCommodityAction } from "@/app/(main)/admin/CreateCommodityAction";
import { CommoditiesTable } from "@/components/screens/home/CommoditiesTable";
import React from "react";

export default async function Page() {
	const commodities = await loadCommodities();
	return (
		<>
			<div className="lg:px-52 mt-20">
				<div className="flex items-center mb-6 justify-between">
					<h1 className="font-bold  text-2xl">Commodities</h1>
					<CreateCommodityAction />
				</div>
				<CommoditiesTable commodities={commodities} />
			</div>
		</>
	);
}
