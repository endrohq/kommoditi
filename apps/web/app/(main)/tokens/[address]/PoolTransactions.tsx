import { fetchTokenTimeline } from "@/app/(main)/actions/timeline";
import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { ListingOutlined } from "@/components/icons/ListingOutlined";
import { baseCommodityUnit } from "@/lib/constants";
import {
	ConsumerPurchaseEvent,
	DistributorPurchaseEvent,
	ListingAddedEvent,
	TimelineEvent,
} from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { formatNumber } from "@/utils/number.utils";
import { getProfileRoute, getTransactionRoute } from "@/utils/route.utils";
import clsx from "clsx";
import Link from "next/link";
import React from "react";

interface TokenSalesOverviewProps {
	tokenAddress: string;
}

export function TimelineItem({
	event,
	idx,
}: { event: TimelineEvent; idx: number }) {
	function generateEventSlogan() {
		switch (event.type) {
			case "listing":
				const listingEvent = event as ListingAddedEvent;
				return (
					<>
						<Link
							className="underline"
							href={getProfileRoute(listingEvent?.producer?.id)}
						>
							{listingEvent?.producer?.name}
						</Link>{" "}
						Listed{" "}
						<span className="font-semibold">
							{listingEvent.quantity}
							{baseCommodityUnit}
						</span>{" "}
						{listingEvent.commodityToken?.name} for sale
					</>
				);
			case "distributorPurchase":
				const distributorPurchase = event as DistributorPurchaseEvent;
				return (
					<>
						<Link
							className="underline"
							href={getProfileRoute(distributorPurchase?.distributor?.id)}
						>
							{distributorPurchase?.distributor?.name}
						</Link>{" "}
						(Consumer) Bought{" "}
						<span className="font-semibold">0{baseCommodityUnit}</span>{" "}
					</>
				);
			case "consumerPurchase":
				const customerPurchase = event as ConsumerPurchaseEvent;
				return (
					<>
						<Link
							className="underline"
							href={getProfileRoute(customerPurchase?.consumer?.id)}
						>
							{customerPurchase?.consumer?.name}
						</Link>{" "}
						(Consumer) Bought{" "}
						<span className="font-semibold">0{baseCommodityUnit}</span>{" "}
					</>
				);
			default:
				return <>Unknown event</>;
		}
	}

	function getActivityPriceField() {
		switch (event.type) {
			case "distributorPurchase":
				return `${formatNumber((event as DistributorPurchaseEvent).totalPrice || 0)} HBAR`;
			case "consumerPurchase":
				return `${formatNumber((event as ConsumerPurchaseEvent).totalPrice || 0)} HBAR`;
			default:
				return "-";
		}
	}

	return (
		<div
			key={`${event.id}-${event.createdAt}`}
			className={clsx("flex items-center rounded py-2.5 px-4", {
				"bg-indigo-50/50": idx % 2 === 0,
			})}
		>
			<div className="flex items-center gap-4 w-6/12">
				<CommodityAvatar size="sm" variant={event.type as any} />
				<div>
					<div className="text-sm gap-x-1 flex items-center">
						{generateEventSlogan()}
					</div>
					<div className="text-xs text-gray-500 gap-1 flex items-center">
						<span>{getDistanceForDate(new Date(event.createdAt))}</span>
						{/*<span>•</span>
						<span className="capitalize">{event.type}</span>*/}
					</div>
				</div>
			</div>
			<div className="w-4/12">
				<Link
					href={getTransactionRoute(event?.transaction?.id)}
					className="text-xs underline"
				>
					{getShortenedFormat(event?.transaction?.id)}
				</Link>
			</div>
			<div className="ml-auto">
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
		<div className="my-6 !mt-12">
			<div>
				<h1 className="text-base font-semibold mb-4 text-gray-800">
					Transactions
				</h1>
			</div>
			<div>
				<div className="flex items-center text-xs text-gray-600 font-medium pb-3 px-4">
					<div className="w-6/12 ">Activity</div>
					<div className="w-4/12">Transaction Hash</div>
					<div className="ml-auto">Balance</div>
				</div>
			</div>
			{timeline?.length > 0 ? (
				timeline.map((event, idx) => (
					<TimelineItem key={event.id} event={event} idx={idx} />
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
