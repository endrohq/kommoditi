import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { usePoolTransactions } from "@/hooks/usePoolTransactions";
import { contracts } from "@/lib/constants";
import { CommodityListing, EthAddress } from "@/typings";
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

	const listings = listingsData as CommodityListing[];

	console.log(listings);

	return (
		<div>
			<h2 className="font-bold text-base mb-2">Listings</h2>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Producer</TableCell>
							{!isLoading && listings?.length > 0 && (
								<>
									<TableHeader>Quantity</TableHeader>
									<TableHeader>Price Offer</TableHeader>
									<TableHeader>Total Price</TableHeader>
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
							listings?.map((listing) => (
								<TableRow>
									<TableCell>{getShortenedFormat(listing.producer)}</TableCell>

									<TableCell>{listing?.quantity?.toString()}</TableCell>
									<TableCell>${formatNumber(listing.price)}</TableCell>
									<TableCell>
										${formatNumber(listing.price * listing.quantity)}
									</TableCell>
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
