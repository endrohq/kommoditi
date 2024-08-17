import { fetchTokenTimeline } from "@/app/(main)/actions/timeline";
import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { ListingOutlined } from "@/components/icons/ListingOutlined";
import {
	DistributorPurchaseEvent,
	ListingAddedEvent,
	TimelineEvent,
} from "@/typings";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
import React from "react";

interface TokenSalesOverviewProps {
	tokenAddress: string;
}

function TimelineItem({ event }: { event: TimelineEvent }) {
	function generateEventSlogan() {
		switch (event.type) {
			case "listing":
				const listingEvent = event as ListingAddedEvent;
				return (
					<>
						Listed{" "}
						<span className="font-semibold">{listingEvent.quantity}KG</span>{" "}
						{listingEvent.commodityToken?.name} for sale
					</>
				);
			case "distributorPurchase":
				const purchaseEvent = event as DistributorPurchaseEvent;
				return (
					<>
						Distributor purchased{" "}
						{/*<span className="font-semibold">{purchaseEvent.quantity}KG</span>{" "}
						{purchaseEvent.commodityToken?.name} for{" "}
						{formatNumber(purchaseEvent.totalPrice)} HBAR*/}
					</>
				);
			default:
				return <>Unknown event</>;
		}
	}

	function getActivityPriceField() {
		switch (event.type) {
			case "distributorPurchase":
				return `+ ${formatNumber((event as DistributorPurchaseEvent).totalPrice || 0)} HBAR`;
			default:
				return "-";
		}
	}

	return (
		<div
			key={`${event.id}-${event.createdAt}`}
			className="flex justify-between my-6"
		>
			<div className="flex items-center gap-4">
				<CommodityAvatar variant={event.type as any} />
				<div>
					<div className="text-sm gap-x-1 flex items-center">
						{generateEventSlogan()}
					</div>
					<div className="text-xs text-gray-500 gap-1 flex items-center">
						<span>{getDistanceForDate(new Date(event.createdAt))}</span>
						<span>•</span>
						<span className="capitalize">{event.type}</span>
					</div>
				</div>
			</div>
			<div className="text-right">
				<div className="text-sm font-semibold">{getActivityPriceField()}</div>
			</div>
		</div>
	);
}

export async function PoolTransactions({
	tokenAddress,
}: TokenSalesOverviewProps) {
	const timeline = await fetchTokenTimeline(tokenAddress);

	return (
		<div className="my-6 !mt-10">
			<div>
				<h1 className="text-lg font-semibold text-gray-800">Transactions</h1>
			</div>
			{timeline?.length > 0 ? (
				timeline.map(({ dateGroup, events }) => (
					<div key={dateGroup}>
						<h2 className="text-sm font-medium text-gray-800">{dateGroup}</h2>
						{events.map((event) => (
							<TimelineItem key={event.id} event={event} />
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
						No activity found for this token.
					</div>
				</div>
			)}
		</div>
	);
}
