"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useCommodities } from "@/hooks/useCommodities";
import { getShortenedFormat } from "@/utils/address.utils";
import { getTokenPage } from "@/utils/route.utils";
import {
	Content,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@carbon/react";
import Link from "next/link";
import React from "react";

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

export function HomePageLayout() {
	const { isLoading, commodities, refetch } = useCommodities({
		isTradable: true,
	});

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
							className="w-full pt-8 px-6 rounded text-right transition-colors bg-indigo-50 shadow-sm hover:shadow-md transition-all group"
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
			<div>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell colSpan={1}>#</TableCell>
								<TableHeader colSpan={8}>Entry</TableHeader>
								<TableHeader colSpan={2}>Token Address</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell>
										<LoadingOutlined />
									</TableCell>
								</TableRow>
							) : commodities?.length > 0 ? (
								commodities?.map((commodity, index) => (
									<TableRow>
										<TableCell colSpan={1}>{index + 1}</TableCell>
										<TableCell colSpan={8}>
											<Link
												href={getTokenPage(commodity?.tokenAddress)}
												className="font-medium flex items-center space-x-2 !text-indigo-900"
											>
												<div className="bg-gray-300 w-6 aspect-square rounded-full" />
												<span>
													{commodity.token.name} ({commodity.token.symbol})
												</span>
											</Link>
										</TableCell>
										<TableCell colSpan={2}>
											{getShortenedFormat(commodity.tokenAddress)}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell>No pools found</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</div>
	);
}
