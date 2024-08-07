"use client";

import { CommodityToken } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getTokenPage } from "@/utils/route.utils";
import {
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

interface CommoditiesTableProps {
	commodities: CommodityToken[] | null;
}

export function CommoditiesTable({ commodities }: CommoditiesTableProps) {
	return (
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
					{commodities && commodities?.length > 0 ? (
						commodities?.map((commodity, index) => (
							<TableRow key={`row-${index}`}>
								<TableCell colSpan={1}>{index + 1}</TableCell>
								<TableCell colSpan={8}>
									<Link
										href={getTokenPage(commodity?.tokenAddress)}
										className="font-medium flex items-center space-x-2 !text-indigo-900"
									>
										<div className="bg-gray-300 w-6 aspect-square rounded-full" />
										<span>
											{commodity.name} ({commodity.symbol})
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
							<TableCell>No commodities found</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
