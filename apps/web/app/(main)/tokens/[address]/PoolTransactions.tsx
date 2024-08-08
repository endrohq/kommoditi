import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
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

export function TransactionList() {
	return (
		<div>
			<h2 className="font-bold text-base mb-2">Transactions</h2>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={4}>Time</TableCell>
							{[]?.length > 0 && (
								<>
									<TableHeader colSpan={4}>Type</TableHeader>
									<TableHeader>HBAR</TableHeader>
									<TableHeader>From</TableHeader>
									<TableHeader>Tx Hash</TableHeader>
								</>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{[]?.length > 0 ? (
							[]?.map((tx, index) => (
								<TableRow className="!text-sm">
									{/*<TableCell className="capitalize" colSpan={4}>
										{getDistanceForDate(tx.createdAt)}
									</TableCell>
									<TableCell className="font-medium !text-black" colSpan={4}>
										-
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
									<TableCell className="text-gray-500 !text-sm">
										{getShortenedFormat(tx.id)}
									</TableCell>*/}
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
