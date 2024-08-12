import { fetchCommoditiesForSale, loadCommodities } from "@/app/(main)/actions";
import { CommoditiesTable } from "@/components/screens/home/CommoditiesTable";

import { ItemForPurchase } from "@/app/(main)/marketplace/ItemForPurchase";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
	title: "Home",
};

export default async function Home() {
	const commodities = await fetchCommoditiesForSale(
		"0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
	);

	return (
		<div className="layout mt-14 mb-20">
			<div className="mb-14">
				<h1 className="text-2xl font-black text-gray-800">
					The Most Efficient{" "}
					<span className="text-green-700">Supply Chain</span>
				</h1>
				<p className="text-base text-gray-900 w-6/12">
					Automate your supply chain with automated contracts, instant-payments
					and sub-second shipment accuracy to reduce costs and increase
					efficiency through the power of{" "}
					<Link className="font-semibold" href="https://hedera.com">
						Hedera Hashgraph
					</Link>
					.
				</p>
			</div>

			<div className="my-8 sm:my-14 mx-auto">
				<div className="grid grid-cols-3 gap-6">
					{commodities?.map((item) => (
						<ItemForPurchase item={item} />
					))}
				</div>
			</div>
		</div>
	);
}
