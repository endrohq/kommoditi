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

export function HomePageLayout() {
	const { isLoading, commodities, refetch } = useCommodities({
		isTradable: true,
	});

	return (
		<Content className="px-56">
			<div className="mb-20 ">
				<h1 className="text-4xl font-bold text-gray-800">Hello Future 👋</h1>
				<p className="text-lg text-gray-600">
					This is the start of an amazing dapp.
				</p>
			</div>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={1}>#</TableCell>
							<TableHeader colSpan={8}>Entry</TableHeader>
							<TableHeader colSpan={2}>Token Address</TableHeader>
							<TableHeader colSpan={2}>LP Address</TableHeader>
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
									<TableCell colSpan={2}>
										{getShortenedFormat(commodity.poolAddress) || "-"}
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
		</Content>
	);
}
