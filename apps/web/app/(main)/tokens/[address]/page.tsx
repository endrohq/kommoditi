import { fetchCommoditiesGroupedByCountry } from "@/app/(main)/actions";
import { PoolStatistics } from "@/app/(main)/tokens/[address]/PoolStatistics";
import { PriceChart } from "@/app/(main)/tokens/[address]/components/PriceChart";
import { TokenPageHeader } from "@/app/(main)/tokens/[address]/components/TokenPageHeader";
import { Button } from "@/components/button";
import { CommodityGroups } from "@/components/commodity/CommodityGroups";
import { ItemForPurchase } from "@/components/commodity/ItemForPurchase";
import { PlusOutlined } from "@/components/icons/PlusOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { PlaceType, Region } from "@/typings";
import { getGeometryForRegion } from "@/utils/location.utils";
import { getTokenPage } from "@/utils/route.utils";
import Link from "next/link";
import React from "react";

interface Props {
	params: {
		address: string;
	};
}

export default async function Page({ params }: Props) {
	const activeCommoditiesByRegion = await fetchCommoditiesGroupedByCountry({
		tokenAddress: params.address,
	});

	const countries = activeCommoditiesByRegion?.map((c) => ({
		id: c.country,
		name: c.country,
		locationType: PlaceType.COUNTRY,
		centerLng: 0,
		centerLat: 0,
	}));

	return (
		<div className="relative">
			<div className="bg-orange-50">
				<MapToDisplay regions={countries} mapHeight={300} />
			</div>
			<div className="!z-[9999] layout flex flex-col -pt-2">
				<div
					style={{ borderBottom: "1px solid #ccc", marginTop: "-30px" }}
					className="bg-white w-full rounded p-2"
				>
					<TokenPageHeader />
				</div>
			</div>
			<div className="layout my-10 space-x-10 flex items-start">
				<div className="w-8/12">
					<PriceChart />
					<div className="gap-10 flex flex-col mt-10">
						<div className="grid grid-cols-3 gap-2">
							{activeCommoditiesByRegion?.map((item) => (
								<ItemForPurchase item={item} />
							))}
						</div>
					</div>
				</div>
				<div className="w-4/12">
					<div className="flex items-center space-x-2 mb-4">
						<div className="px-3 py-1.5 rounded-full bg-gray-100 font-medium text-sm">
							Buy
						</div>
						<Link href={`${getTokenPage(params.address)}/liquidity`}>
							<div className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100">
								Add Liquidity
							</div>
						</Link>
					</div>
					<div className="bg-gray-100 rounded py-20"></div>
				</div>
			</div>
		</div>
	);
}
