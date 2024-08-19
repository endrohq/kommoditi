import { fetchParticipantsWithLocations } from "@/app/actions";
import { networkId } from "@/lib/constants";
import { ParticipantType, ParticipantUserView, Region } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { findTradingPartners } from "@/utils/overlap.utils";
import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

async function getParticipantDetails(
	participantId: string,
): Promise<ParticipantUserView | null> {
	const { data, error } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.eq("id", participantId)
		.eq("chainId", networkId)
		.single<ParticipantUserView>();

	if (error) {
		console.error("Error fetching participant details:", error);
		return null;
	}

	return data;
}

function isParticipantInCountry(
	participant: ParticipantUserView,
	country: string,
): boolean {
	return participant.locations
		?.map((item) => getCountryNameFromAddress(item.name))
		.some((location) => location === country);
}

async function getCommoditiesForParticipants(
	participantIds: string[],
	tokenAddress: string,
) {
	const { data, error } = await supabase
		.from("commodity")
		.select("*")
		.in("currentOwnerId", participantIds)
		.eq("tokenAddress", tokenAddress)
		.eq("chainId", networkId);

	if (error) {
		console.error("Error fetching commodities:", error);
		return [];
	}

	return data;
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const participantId = searchParams.get("participantId");
	const tokenAddress = searchParams.get("tokenAddress");
	const country = searchParams.get("country"); // Optional, only for consumers

	if (!participantId || !tokenAddress || !country) {
		return NextResponse.json(
			{ error: "participantId and tokenAddress are required" },
			{ status: 400 },
		);
	}

	try {
		const participant = await getParticipantDetails(participantId);
		if (!participant) {
			return NextResponse.json(
				{ error: "Participant not found" },
				{ status: 404 },
			);
		}

		const participants = await fetchParticipantsWithLocations(
			participant.type === ParticipantType.CONSUMER
				? ParticipantType.DISTRIBUTOR
				: ParticipantType.PRODUCER,
		);
		const eligibleDistributors = findTradingPartners(participants, participant);
		const partners = participants.filter(
			(participant) =>
				eligibleDistributors.includes(participant.id) &&
				isParticipantInCountry(participant, country),
		);

		const filteredPartnerIds = partners.map((p) => p.id);
		const allCommodities = await getCommoditiesForParticipants(
			filteredPartnerIds,
			tokenAddress,
		);

		// Count commodities by owner and collect listing IDs
		const commodityCounts = allCommodities.reduce(
			(acc, commodity) => {
				if (!acc[commodity.currentOwnerId]) {
					acc[commodity.currentOwnerId] = { quantity: 0, listingIds: [] };
				}
				acc[commodity.currentOwnerId].quantity += 1;
				if (
					acc[commodity.currentOwnerId].listingIds.indexOf(
						commodity.listingId,
					) === -1
				) {
					acc[commodity.currentOwnerId].listingIds.push(commodity.listingId);
				}
				return acc;
			},
			{} as Record<string, { quantity: number; listingIds: number[] }>,
		);

		const partnersWithCommodities = partners.map((partner) => ({
			partner,
			quantity: commodityCounts[partner.id]?.quantity || 0,
			listingIds: commodityCounts[partner.id]?.listingIds || [],
		}));

		return NextResponse.json({
			options: partnersWithCommodities,
			destination: getCountryNameFromAddress(participant.locations?.[0].name),
		});
	} catch (error) {
		console.error("Error processing trade route request:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
