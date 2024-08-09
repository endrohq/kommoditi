"use server";

import {
	CommodityToken,
	GroupedByDateTimeline,
	ListingAdded,
	TimelineEvent,
} from "@/typings";
import supabase from "@/utils/supabase.utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";

export async function loadCommodities() {
	const { data: commodities, error } = await supabase
		.from("commodityToken")
		.select("*")
		.returns<CommodityToken[]>();

	return commodities;
}

interface PurchaseEvent {
	id: string;
	type: "purchase";
	createdAt: string;
	tokenAddress: string;
	listingId: number;
	price: number;
	quantity: number;
}

export async function fetchProducerTimeline(
	address: string,
): Promise<GroupedByDateTimeline[]> {
	// Fetch listings
	const { data: listings, error: listingError } = await supabase
		.from("listing")
		.select(
			"*,commodityToken(*),transaction:transactionHash(*),quantity:commodity(count)",
		)
		.eq("producerId", address);

	if (listingError) {
		console.error("Error fetching listings:", listingError);
		return [];
	}

	const listingIds = listings.map((l) => l.id);

	// Fetch purchases
	const { data: purchases, error: purchaseError } = await supabase
		.from("ctfPurchase")
		.select("*,commodityToken(*),transaction:transactionHash(*)")
		.in("listingId", listingIds);

	if (purchaseError) {
		console.error("Error fetching purchases:", purchaseError);
		return [];
	}

	// Combine and sort all events
	const allEvents: TimelineEvent[] = [
		...listings.map((l) => ({
			...l,
			quantity: l.quantity?.[0]?.count || 0,
			type: "listing" as const,
		})),
		...purchases.map((p) => ({ ...p, type: "purchase" as const })),
	].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	console.log(allEvents);
	// Group events by date
	const groupedEvents: { [key: string]: TimelineEvent[] } = {};

	allEvents.forEach((event) => {
		let dateGroup: string;

		if (isToday(event.createdAt)) {
			dateGroup = "Today";
		} else if (isYesterday(event.createdAt)) {
			dateGroup = "Yesterday";
		} else {
			dateGroup = format(event.createdAt, "EEEE, MMMM d, yyyy");
		}

		if (!groupedEvents[dateGroup]) {
			groupedEvents[dateGroup] = [];
		}

		groupedEvents[dateGroup].push(event);
	});

	// Convert the grouped object to an array
	return Object.entries(groupedEvents)
		.map(([dateGroup, events]) => ({ dateGroup, events }))
		.sort((a, b) => {
			if (a.dateGroup === "Today") return -1;
			if (b.dateGroup === "Today") return 1;
			if (a.dateGroup === "Yesterday") return -1;
			if (b.dateGroup === "Yesterday") return 1;
			return new Date(b.dateGroup).getTime() - new Date(a.dateGroup).getTime();
		});
}
