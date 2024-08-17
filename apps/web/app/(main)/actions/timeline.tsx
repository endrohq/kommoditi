import { GroupedByDateTimeline, TimelineEvent } from "@/typings";
import supabase from "@/utils/supabase.utils";
import { format, isToday, isYesterday } from "date-fns";

function groupEventsByDate(events: TimelineEvent[]): GroupedByDateTimeline[] {
	const groupedEvents: { [key: string]: TimelineEvent[] } = {};

	events.forEach((event) => {
		console.log(event);
		const eventDate = new Date(event.createdAt);
		let dateGroup: string;

		if (isToday(eventDate)) {
			dateGroup = "Today";
		} else if (isYesterday(eventDate)) {
			dateGroup = "Yesterday";
		} else {
			dateGroup = format(eventDate, "EEEE, MMMM d, yyyy");
		}

		if (!groupedEvents[dateGroup]) {
			groupedEvents[dateGroup] = [];
		}

		groupedEvents[dateGroup].push(event);
	});

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

export async function fetchProducerTimeline(
	address: string,
): Promise<GroupedByDateTimeline[]> {
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

	const { data: purchases, error: purchaseError } = await supabase
		.from("distributorPurchase")
		.select("*,commodityToken(*),transaction:transactionHash(*),distributor(*)")
		.in("listingId", listingIds);

	if (purchaseError) {
		console.error("Error fetching purchases:", purchaseError);
		return [];
	}

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

	return groupEventsByDate(allEvents);
}

export async function fetchTokenTimeline(
	tokenAddress: string,
): Promise<GroupedByDateTimeline[]> {
	const { data: token, error: tokenError } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("tokenAddress", tokenAddress)
		.single();

	if (tokenError) {
		console.error("Error fetching token:", tokenError);
		return [];
	}

	const { data: listings, error: listingError } = await supabase
		.from("listing")
		.select("*, participant:producerId(*), transaction:transactionHash(*)")
		.eq("tokenAddress", tokenAddress);

	if (listingError) {
		console.error("Error fetching listings:", listingError);
		return [];
	}

	const { data: distributorPurchases, error: distributorPurchaseError } =
		await supabase
			.from("distributorPurchase")
			.select(
				"*, participant:distributorId(*), transaction:transactionHash(*), listing(*)",
			)
			.eq("tokenAddress", tokenAddress);

	if (distributorPurchaseError) {
		console.error(
			"Error fetching distributor purchases:",
			distributorPurchaseError,
		);
		return [];
	}

	const { data: commodities, error: commodityError } = await supabase
		.from("commodity")
		.select("*, participant:currentOwnerId(*), listing(*)")
		.eq("tokenAddress", tokenAddress);

	if (commodityError) {
		console.error("Error fetching commodities:", commodityError);
		return [];
	}

	const allEvents: TimelineEvent[] = [
		{
			type: "tokenCreation",
			...token,
			createdAt: token.createdAt,
		},
		...listings.map((l) => ({
			type: "listing",
			...l,
			createdAt: l.createdAt,
		})),
		...distributorPurchases.map((p) => ({
			type: "distributorPurchase",
			...p,
			createdAt: p.createdAt,
		})),
	].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);

	return groupEventsByDate(allEvents);
}
