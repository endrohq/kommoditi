import { fetchCommoditiesGroupedByCountry } from "@/app/(main)/actions";
import { PoolStatistics } from "@/app/(main)/tokens/[address]/PoolStatistics";
import { PriceChart } from "@/app/(main)/tokens/[address]/components/PriceChart";
import { TokenPageHeader } from "@/app/(main)/tokens/[address]/components/TokenPageHeader";
import { Button } from "@/components/button";
import { CommodityGroups } from "@/components/commodity/CommodityGroups";
import { ItemForPurchase } from "@/components/commodity/ItemForPurchase";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { PlaceType, Region } from "@/typings";
import { getGeometryForRegion } from "@/utils/location.utils";
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
					style={{ borderBottom: "1px solid #ccc", marginTop: "-110px" }}
					className="bg-white w-6/12 rounded py-2 px-4 "
				>
					<TokenPageHeader />
					{/*<div className="w-2/12">
						<Link href={`${getTokenPage(params.address)}/liquidity`}>
							<Button icon={<PlusOutlined />}>Add Liquidity</Button>
						</Link>
					</div>*/}
				</div>
			</div>
			<div className="layout my-10">
				<PriceChart />
				<PoolStatistics />
				<div className="gap-10 flex flex-col mt-10">
					<div className="grid grid-cols-3 gap-2">
						{activeCommoditiesByRegion?.map((item) => (
							<ItemForPurchase item={item} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
