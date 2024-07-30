import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { usePoolTransactions } from "@/hooks/usePoolTransactions";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { EthAddress } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
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

interface TransactionListProps {
	poolAddress: EthAddress;
}

const eventNames = [
	"LiquidityAdded",
	"ListingAdded",
	"ListingSold",
	"LiquidityRemoved",
];

export function TransactionList() {
	const { commodity } = useTokenPage();
	const { transactions, isLoading } = usePoolTransactions(
		commodity?.poolAddress as EthAddress,
		eventNames,
	);

	return (
		<div>
			<h2 className="font-bold text-base mb-2">Transactions</h2>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={4}>Time</TableCell>
							{!isLoading && transactions?.length > 0 && (
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
						) : transactions?.length > 0 ? (
							transactions?.map((tx, index) => (
								<TableRow>
									<TableCell className="capitalize" colSpan={4}>
										{getDistanceForDate(tx.dateCreated)}
									</TableCell>
									<TableCell className="font-medium !text-black" colSpan={4}>
										{formatTransactionType(tx.type)}
									</TableCell>
									<TableCell>{tx.value}</TableCell>
									<TableCell>
										<Link
											className="text-blue-800"
											href={getProfileRoute(tx.from)}
										>
											{getShortenedFormat(tx.from)}
										</Link>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell>No transactions found</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
