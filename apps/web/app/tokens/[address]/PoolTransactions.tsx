import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { usePoolTransactions } from "@/hooks/usePoolTransactions";
import { EthAddress } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
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
import React from "react";

interface TransactionListProps {
	poolAddress: EthAddress;
}

const eventNames = ["LiquidityAdded", "ListingAdded"];

export function TransactionList({ poolAddress }: TransactionListProps) {
	const { transactions, isLoading } = usePoolTransactions(
		poolAddress,
		eventNames,
	);

	console.log(isLoading, transactions);

	return (
		<>
			<h2 className="font-bold text-xl mb-6">Transactions</h2>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={4}>Time</TableCell>
							{!isLoading && transactions?.length > 0 && (
								<>
									<TableHeader colSpan={4}>Type</TableHeader>
									<TableHeader>Amount</TableHeader>
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
									<TableCell colSpan={4}>
										{getDistanceForDate(tx.dateCreated)}
									</TableCell>
									<TableCell colSpan={4}>
										<div className="capitalize flex w-full">
											{formatTransactionType(tx.type)}
										</div>
									</TableCell>
									<TableCell>{formatNumber(tx.value)}</TableCell>
									<TableCell>{getShortenedFormat(tx.from)}</TableCell>
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
		</>
	);
}

export default TransactionList;
