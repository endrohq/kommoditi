"use client";

import { SaleItemModal } from "@/app/producers/components/SaleItemModal";
import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { useAuth } from "@/providers/AuthProvider";
import {
	GroupedByDateTimeline,
	ListingAdded,
	ListingAddedEvent,
	TimelineEvent,
} from "@/typings";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
import { useEffect, useState } from "react";

interface SalesOverviewProps {
	getProducerTimeline(address: string): Promise<GroupedByDateTimeline[]>;
}

function ListingAddedItem({ listing }: { listing: ListingAddedEvent }) {
	return (
		<div
			key={`${listing.id}-${listing.createdAt}`}
			className="flex items-center justify-between my-6"
		>
			<div className="flex items-center gap-4">
				<CommodityAvatar variant="listed" />
				<div>
					<div className="text-sm gap-x-1 flex items-center">
						<span>
							Listed <span className="font-semibold">{listing.quantity}KG</span>{" "}
							{listing?.commodityToken?.name} for purchase
						</span>
					</div>
					<div className="text-xs text-gray-500 gap-1 flex items-center">
						<span>{getDistanceForDate(new Date(listing.createdAt))}</span>
						<span>•</span>
						<span>Listed</span>
					</div>
				</div>
			</div>
			<div className="text-sm">
				{listing.type === "listing"
					? "0.00 HBAR"
					: formatNumber((listing as any).price || 0)}
			</div>
		</div>
	);
}

function PurchasedItem({ listing }: { listing: ListingAddedEvent }) {
	return (
		<div
			key={`${listing.id}-${listing.createdAt}`}
			className="flex justify-between my-6"
		>
			<div className="flex items-center gap-4">
				<CommodityAvatar variant="listed" />
				<div>
					<div className="text-sm gap-x-1 flex items-center">
						<span>
							Listed <span className="font-semibold">40</span>{" "}
							{listing?.commodityToken?.name} for purchase
						</span>
						<span>•</span>
						<span>Listed</span>
					</div>
					<div className="text-xs text-gray-500">
						{getDistanceForDate(new Date(listing.createdAt))}
					</div>
				</div>
			</div>
			<div className="text-sm">
				{listing.type === "listing"
					? "0.00 HBAR"
					: formatNumber((listing as any).price || 0)}
			</div>
		</div>
	);
}

export function SalesOverview({ getProducerTimeline }: SalesOverviewProps) {
	const { account } = useAuth();
	const [activeTx, setActiveTx] = useState<TimelineEvent>();
	const [isLoading, setIsLoading] = useState(true);
	const [listings, setListings] = useState<GroupedByDateTimeline[]>([]);

	useEffect(() => {
		async function loadListings(address: string) {
			const data = await getProducerTimeline(address);
			setListings(data);
			setIsLoading(false);
		}

		if (account?.address) {
			loadListings(account?.address);
		}
	}, [account?.address]);

	return (
		<>
			<div className="my-6">
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
					: listings.map(({ dateGroup, events }) => (
							<div key={dateGroup}>
								<h2 className="text-sm font-medium text-gray-800">
									{dateGroup}
								</h2>
								{events.map((listing) => (
									<ListingAddedItem key={listing.id} listing={listing} />
								))}
							</div>
						))}
			</div>
			{activeTx && (
				<SaleItemModal
					handleClose={() => setActiveTx(undefined)}
					listing={activeTx}
				/>
			)}
		</>
	);
}
