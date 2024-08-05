"use client";

import { SaleItemModal } from "@/app/producers/components/SaleItemModal";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { MobileModal } from "@/components/modal/MobileModal";
import { contracts } from "@/lib/constants";
import { CommodityListing, EthAddress } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { parseListings } from "@/utils/parser.utils";
import { useState } from "react";
import { useReadContracts } from "wagmi";

interface SalesOverviewProps {
	poolAddresses: EthAddress[];
	address: EthAddress;
}

export function SalesOverview({ poolAddresses, address }: SalesOverviewProps) {
	const [activeListing, setActiveListing] = useState<CommodityListing>();
	const { data, isLoading } = useReadContracts({
		contracts: poolAddresses.map((poolAddress) => ({
			address: poolAddress,
			abi: contracts.commodityPool.abi,
			functionName: "getListingsByProducer",
			args: [address],
		})),
	});

	const listings = data?.flatMap((result: Record<string, any>) =>
		parseListings(result.result),
	);

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
					: listings?.map((listing, i: number) => (
							<div
								onClick={() => setActiveListing(listing)}
								key={i}
								className="flex items-center justify-between my-6"
							>
								<div className="flex items-center ">
									<div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
									<div>
										<div className="text-xs text-gray-500">
											{getDistanceForDate(listing.dateOffered)}
										</div>
										<div className="text-sm">
											Quantity:{" "}
											<span className="font-semibold">
												{listing.serialNumbers?.length - 1}
											</span>
										</div>
									</div>
								</div>
								<div className="w-16 h-4 bg-gray-200 rounded-full"></div>
							</div>
						))}
			</div>
			{activeListing && (
				<SaleItemModal
					handleClose={() => setActiveListing(undefined)}
					listing={activeListing}
				/>
			)}
		</>
	);
}
