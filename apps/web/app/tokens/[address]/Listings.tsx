import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { usePoolTransactions } from "@/hooks/usePoolTransactions";
import { contracts } from "@/lib/constants";
import { EthAddress } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
import { getProfileRoute } from "@/utils/route.utils";
import { formatTransactionType } from "@/utils/transaction.utils";
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
import { useReadContract } from "wagmi";

interface TransactionListProps {
	poolAddress: EthAddress;
}

const { commodityPool } = contracts;

export function Listings({ poolAddress }: TransactionListProps) {
	const { data: listingsData, isLoading } = useReadContract({
		address: poolAddress,
		abi: commodityPool.abi,
		functionName: "getListings",
	});

	const listings = listingsData as any[];

	return (
		<div>
			<h2 className="font-bold text-xl mb-6">Listings</h2>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={4}>Time</TableCell>
							{!isLoading && listings?.length > 0 && (
								<>
									<TableHeader colSpan={4}>Type</TableHeader>
									<TableHeader>HBAR</TableHeader>
									<TableHeader>Wallet</TableHeader>
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
						) : listings?.length > 0 ? (
							listings?.map((tx, index) => (
								<TableRow>
									<TableCell className="capitalize" colSpan={4}></TableCell>
									<TableCell
										className="font-medium !text-black"
										colSpan={4}
									></TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell>No listings found</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
