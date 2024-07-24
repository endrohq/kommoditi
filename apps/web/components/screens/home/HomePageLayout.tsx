"use client";

import { CommodityItem } from "@/app/admin/CommodityItem";
import { ButtonWithAuthentication } from "@/components/button/ButtonWithAuthentication";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { CommodityListing } from "@/typings";
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
import { useReadContract, useSendTransaction } from "wagmi";

const { commodityExchange } = contracts;

export function HomePageLayout() {
	const { account } = useAuth();
	const { sendTransaction } = useSendTransaction();
	const { data: commoditiesData, isLoading } = useReadContract({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "getListedCommodities",
	});

	const data = commoditiesData as CommodityListing[];

	console.log(data);

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
							{!isLoading && data?.length > 0 && (
								<>
									<TableHeader colSpan={4}>Price</TableHeader>
									<TableHeader colSpan={4}>Producer</TableHeader>
									<TableHeader colSpan={4}>Token Address</TableHeader>
								</>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell>
									<LoadingOutlined />
								</TableCell>
							</TableRow>
						) : data?.length > 0 ? (
							data?.map((row) => (
								<TableRow>
									<TableCell colSpan={4}>
										{formatNumber(row.quantity)}
									</TableCell>
									<TableCell colSpan={4}>{formatNumber(row.price)}</TableCell>
									<TableCell colSpan={4}>{row.producer}</TableCell>
									<TableCell colSpan={4}>{row.tokenAddress}</TableCell>
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
		</Content>
	);
}
