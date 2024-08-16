import {
	fetchCommoditiesGroupedByCountry,
	fetchCommodity,
	getCountriesWhereCommodityTokenIsActiveIn,
} from "@/app/(main)/actions";
import { PriceChart } from "@/app/(main)/tokens/[address]/components/PriceChart";
import { TokenPageHeader } from "@/app/(main)/tokens/[address]/components/TokenPageHeader";
import { TransactWidget } from "@/app/(main)/tokens/[address]/components/widget/TransactWidget";
import { ItemForPurchase } from "@/components/commodity/ItemForPurchase";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { PlaceType, Region } from "@/typings";
import { Metadata } from "next";
import React from "react";

interface Props {
	params: {
		address: string;
	};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const token = await fetchCommodity(params.address);
	return {
		title: `${token?.name || params.address} (${token?.symbol || "-"}) `,
	};
}

export default async function Page({ params }: Props) {
	const countries = await getCountriesWhereCommodityTokenIsActiveIn(
		params.address,
	);

	return (
		<div className="relative">
			<div className="bg-orange-50">
				<MapToDisplay regions={countries} mapHeight={225} />
			</div>
			<div className="!z-[999] layout flex flex-col -pt-2">
				<div
					style={{ marginTop: "-60px" }}
					className="bg-white shadow-sm w-full rounded p-6"
				>
					<TokenPageHeader />
				</div>
			</div>
			<div className="layout my-10 space-x-10 flex items-start px-6">
				<div className="w-8/12">
					<PriceChart />
				</div>
				<div className="w-4/12">
					<TransactWidget countries={countries} address={params.address} />
				</div>
			</div>
		</div>
	);
}
