"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useCommodityPools } from "@/hooks/useCommodityPools";
import { contracts } from "@/lib/constants";
import { formatNumber } from "@/utils/number.utils";
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
import React from "react";

export function HomePageLayout() {
	const { pools, isLoading } = useCommodityPools();

	return (
		<Content>
			<div className="mb-20">
				<h1 className="text-4xl font-bold text-gray-800">Hello Future 👋</h1>
				<p className="text-lg text-gray-600">
					This is the start of an amazing dapp.
				</p>
			</div>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader colSpan={4}>Entry</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell>
									<LoadingOutlined />
								</TableCell>
							</TableRow>
						) : pools?.length > 0 ? (
							pools?.map((row) => (
								<TableRow>
									<TableCell colSpan={4}>{row}</TableCell>
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
