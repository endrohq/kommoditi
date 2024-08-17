import {
	fetchCommoditiesGroupedByCountry,
	fetchCommodity,
	getCountriesWhereCommodityTokenIsActiveIn,
} from "@/app/(main)/actions";
import { PoolTransactions } from "@/app/(main)/tokens/[address]/PoolTransactions";
import { TokenStatistics } from "@/app/(main)/tokens/[address]/TokenStatistics";
import { PriceChart } from "@/app/(main)/tokens/[address]/components/PriceChart";
import { TokenPageHeader } from "@/app/(main)/tokens/[address]/components/TokenPageHeader";
import { TokenPageMap } from "@/app/(main)/tokens/[address]/components/TokenPageMap";
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
	return (
		<div className="relative">
			<TokenPageMap />
			<TokenPageHeader />
			<div className="layout my-10 space-x-10 flex items-start px-10">
				<div className="w-8/12">
					<PriceChart />
					<PoolTransactions tokenAddress={params.address} />
				</div>
				<div className="w-4/12">
					<TransactWidget address={params.address} />
				</div>
			</div>
		</div>
	);
}
