import { fetchCommoditiesGroupedByCountry } from "@/app/actions";

import { ItemForPurchase } from "@/components/commodity/ItemForPurchase";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
	title: "Home",
};

export default async function Home() {
	const commodities = await fetchCommoditiesGroupedByCountry({});

	return (
		<div className="">
			<div className="bg-black homepage-banner pb-24 pt-24">
				<div className="layout">
					<p className="text-2xl text-gray-100 leading-relaxed w-6/12">
						Kommodoti is a supply chain protocol where adaptive pricing engines,
						seamless commodity sourcing and automatic client acquisition reduce
						costs and increase efficiency through the power of Hedera.
					</p>
				</div>
			</div>

			<div className="my-8 sm:mt-20 mx-auto layout">
				<div className="mb-10">
					<h2 className="font-semibold text-2xl leading-tight mb-1">
						Commodities being
						<br />
						traded across the globe
					</h2>
					<p className="w-6/12 text-sm text-gray-600">
						Commodities originate from different countries and are traded
						through distributors so that consumers can purchase them. The
						commodities are grouped by country and are available for purchase.
					</p>
				</div>
				<div className="grid grid-cols-4 gap-4">
					{commodities?.map((item) => (
						<ItemForPurchase item={item} />
					))}
				</div>
			</div>
		</div>
	);
}
