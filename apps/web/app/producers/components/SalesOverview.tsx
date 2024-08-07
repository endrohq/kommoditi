"use client";

import { SaleItemModal } from "@/app/producers/components/SaleItemModal";
import { usePoolTransactions } from "@/hooks/usePoolTransactions";
import { useAuth } from "@/providers/AuthProvider";
import { EthAddress, PoolTransaction } from "@/typings";
import { getDistanceForDate } from "@/utils/date.utils";
import { useState } from "react";

interface SalesOverviewProps {
	poolAddresses: EthAddress[];
}

export function SalesOverview({ poolAddresses }: SalesOverviewProps) {
	const { account } = useAuth();
	const [activeTx, setActiveTx] = useState<PoolTransaction>();

	const { transactions, isLoading } = usePoolTransactions(poolAddresses, {
		address: account?.address,
	});

	return (
		<>
			<div className="my-6">
				<h2 className="font-bold mb-2">Sales</h2>
				{isLoading
					? ["", "", "", "", ""].map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between animate-pulse my-6"
							>
								<div className="flex items-center">
									<div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
									<div>
										<div className="w-24 h-4 bg-gray-200 rounded-full"></div>
										<div className="w-16 h-4 bg-gray-200 rounded-full mt-2"></div>
									</div>
								</div>
								<div className="w-16 h-4 bg-gray-200 rounded-full"></div>
							</div>
						))
					: transactions?.map((tx, i: number) => (
							<div
								onClick={() => setActiveTx(tx)}
								key={i}
								className="flex items-center justify-between my-6"
							>
								<div className="flex items-center ">
									<div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
									<div>
										<div className="text-xs text-gray-500">
											{getDistanceForDate(tx.dateCreated)}
										</div>
										<div className="text-sm">
											Quantity:{" "}
											<span className="font-semibold">
												{tx.args.serialNumbers?.length - 1}
											</span>
										</div>
									</div>
								</div>
								<div className="w-16 h-4 bg-gray-200 rounded-full"></div>
							</div>
						))}
			</div>
			{activeTx && (
				<SaleItemModal
					handleClose={() => setActiveTx(undefined)}
					tx={activeTx}
				/>
			)}
		</>
	);
}
