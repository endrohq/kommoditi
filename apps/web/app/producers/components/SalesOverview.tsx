"use client";

import { TimelineItem } from "@/app/(main)/tokens/[address]/PoolTransactions";
import { SaleItemModal } from "@/app/producers/components/SaleItemModal";
import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { ListingOutlined } from "@/components/icons/ListingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { useAuth } from "@/providers/AuthProvider";
import {
	DistributorPurchaseEvent,
	GroupedByDateTimeline,
	TimelineEvent,
} from "@/typings";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
import { useEffect, useState } from "react";

interface SalesOverviewProps {
	getProducerTimeline(address: string): Promise<GroupedByDateTimeline[]>;
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
				{isLoading ? (
					["", "", "", "", ""].map((_, i) => (
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
				) : listings?.length > 0 ? (
					listings.map(({ dateGroup, events }) => (
						<div key={dateGroup}>
							<h2 className="text-sm font-medium text-gray-800">{dateGroup}</h2>
							{events.map((event, idx) => (
								<TimelineItem key={event.id} event={event} idx={idx} />
							))}
						</div>
					))
				) : (
					<div className="flex flex-col items-center mt-14">
						<div>
							<div className="bg-gray-100 rounded-full p-7">
								<ListingOutlined className="text-gray-300 text-3xl" />
							</div>
						</div>
						<div className="text-sm text-gray-400 text-center px-14 mt-6">
							No activity found. List your first produced goods like Cacao or
							basmati rice to start.
						</div>
					</div>
				)}
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
