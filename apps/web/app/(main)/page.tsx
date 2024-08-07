import { loadCommodities } from "@/app/(main)/actions";
import { CommoditiesTable } from "@/components/screens/home/CommoditiesTable";

import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
	title: "Home | Hello Future",
};

const participants = [
	{
		href: "/producers",
		name: "Producer",
		image: "/producers.jpg",
		description: "Explore the app as the creators of commodities",
	},
	{
		href: "/ctfs",
		name: "Logistics",
		description: "Explore the app as the logistics provider",
		image: "/logistics.jpg",
	},
	{
		href: "/consumers",
		name: "Consumer",
		image: "/consumers.jpg",
		description: "Explore the app as the consumers of commodities",
	},
];

export default async function Home() {
	const commodities = await loadCommodities();
	return (
		<div className="layout mt-14 mb-20">
			<div className="mb-14 space-y-2">
				<h1 className="text-4xl font-black text-gray-800">
					Powering your
					<br />
					<span className="text-green-700">supply chain</span>
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

			<div className="grid grid-cols-3 gap-6 w-full mb-20">
				{
					// This is a list of participants
					participants.map((participant) => (
						<Link
							href={participant.href}
							style={{
								backgroundImage: `linear-gradient(to bottom left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.2)), url(${participant.image})`,
								backgroundPosition: "top",
								backgroundSize: "cover",
							}}
							className="w-full pt-8 px-6 rounded text-right bg-indigo-50 shadow-sm hover:shadow-md transition-all group"
						>
							<div className="capitalize group-hover:text-blue-700 text-xl font-bold text-black">
								{participant.name}
							</div>
							<p className="text-gray-600 text-sm pb-72 font-medium">
								{participant.description}
							</p>
						</Link>
					))
				}
			</div>
			<CommoditiesTable commodities={commodities} />
		</div>
	);
}
