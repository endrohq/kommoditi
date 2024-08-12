"use server";

import {
	CommodityToken,
	EnhancedCommodity,
	EthAddress,
	GroupedByDateTimeline,
	ParticipantUserView,
	TimelineEvent,
} from "@/typings";
import { findTradingPartners } from "@/utils/overlap.utils";
import supabase from "@/utils/supabase.utils";
import { format, isToday, isYesterday } from "date-fns";

export async function loadCommodities() {
	const { data: commodities, error } = await supabase
		.from("commodityToken")
		.select("*")
		.returns<CommodityToken[]>();

	return commodities;
}

export async function fetchCommoditiesForSale(
	address: string,
): Promise<EnhancedCommodity[]> {
	const participantUserViews = await fetchParticipantsWithLocations();
	const currentParticipant = participantUserViews.find((p) => p.id === address);
	const participantIds = findTradingPartners(
		participantUserViews,
		currentParticipant,
	);

	const { data: commodities, error } = await supabase
		.from("commodity")
		.select(`
      *,
      commodityToken(*),
      participant:producerId(*),
      listing(*)
    `)
		.in("currentOwnerId", participantIds);

	if (error) {
		console.error("Error fetching commodities for sale:", error);
		throw new Error("Failed to fetch commodities for sale");
	}

	// Group and enhance commodities
	const groupedCommodities = commodities.reduce(
		(acc, commodity) => {
			const key = `${commodity.tokenAddress}-${commodity.listingId}`;
			if (!acc[key]) {
				const producer = participantUserViews.find(
					(p) => p.id === commodity.producerId,
				);
				const location = producer?.locations?.[0]; // Assuming the first location is the primary one

				acc[key] = {
					tokenAddress: commodity.tokenAddress,
					listingId: commodity.listingId,
					quantity: 0,
					label: `${location?.name || "Unknown"} ${commodity.commodityToken?.name || "Commodity"}`,
					producer,
					ctf: commodity.currentOwnerId,
					producerLocation: location?.name || "Unknown Location",
					price: commodity.listing?.price || 0, // Assuming there's a price field in the listing
				};
			}
			acc[key].quantity += 1;
			return acc;
		},
		{} as Record<string, EnhancedCommodity>,
	);

	console.log(groupedCommodities);

	return Object.values(groupedCommodities);
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
		.select("*,commodityToken(*),transaction:transactionHash(*),ctf(*)")
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

export async function fetchParticipantsWithLocations(): Promise<
	ParticipantUserView[]
> {
	const { data, error } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.returns<ParticipantUserView[]>();

	console.log(data);
	return data || ([] as ParticipantUserView[]);
}
