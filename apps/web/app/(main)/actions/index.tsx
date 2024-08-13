"use server";

import {
	CommodityToken,
	EnhancedCommodity,
	GroupedByDateTimeline,
	ParticipantType,
	ParticipantUserView,
	Region,
	TimelineEvent,
} from "@/typings";
import { extractCountryName, labelCommodity } from "@/utils/commodity.utils";
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

export async function fetchCommodity(tokenAddress: string) {
	const { data: commodity, error } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("tokenAddress", tokenAddress)
		.single<CommodityToken>();

	return commodity;
}

type FetchCommoditiesOptions = {
	tokenAddress?: string;
	address?: string;
};

export async function fetchCommoditiesGroupedByCountry({
	tokenAddress,
	address,
}: FetchCommoditiesOptions): Promise<EnhancedCommodity[]> {
	const participantUserViews = await fetchParticipantsWithLocations();
	const currentParticipant = participantUserViews.find((p) => p.id === address);
	let participantIds: string[] = [];
	if (currentParticipant) {
		participantIds = findTradingPartners(
			participantUserViews,
			currentParticipant,
		);
	} else {
		participantIds = participantUserViews
			.filter((p) => p.type === ParticipantType.CTF)
			.map((p) => p.id);
	}

	const query = supabase
		.from("commodity")
		.select(`
      *,
      commodityToken(*),
      participant:producerId(*)
    `)
		.in("currentOwnerId", participantIds);

	if (tokenAddress) {
		query.eq("tokenAddress", tokenAddress);
	}

	const { data: commodities, error } = await query;

	if (error) {
		console.error("Error fetching commodities for sale:", error);
		throw new Error("Failed to fetch commodities for sale");
	}

	// Group and enhance commodities
	const groupedCommodities = commodities.reduce(
		(acc, commodity) => {
			const producer = participantUserViews.find(
				(p) => p.id === commodity.producerId,
			);
			if (!producer) {
				return acc;
			}
			const location = producer?.locations?.[0] as Region; // Assuming the first location is the primary one
			const groupLabel = labelCommodity(
				location.name,
				commodity.commodityToken?.name,
			);

			if (!acc[groupLabel]) {
				acc[groupLabel] = {
					token: commodity.commodityToken,
					quantity: 0,
					label: labelCommodity(location.name, commodity.commodityToken?.name),
					currentOwnerId: commodity.currentOwnerId,
					producers: new Set([producer.id]),
					country: extractCountryName(location.name),
				};
			}
			if (!acc[groupLabel].producers.has(producer.id)) {
				acc[groupLabel].producers.add(producer.id);
			}

			acc[groupLabel].quantity += 1;
			return acc;
		},
		{} as Record<string, EnhancedCommodity>,
	);

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

	return data || ([] as ParticipantUserView[]);
}
