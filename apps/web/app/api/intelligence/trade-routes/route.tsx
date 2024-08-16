import { fetchParticipantsWithLocations } from "@/app/(main)/actions";
import { ParticipantType, ParticipantUserView, Region } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { findTradingPartners } from "@/utils/overlap.utils";
import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

async function getConsumerDetails(
	consumerId: string,
): Promise<ParticipantUserView | null> {
	const { data, error } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.eq("id", consumerId)
		.single<ParticipantUserView>();

	if (error) {
		console.error("Error fetching consumer details:", error);
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
		.eq("tokenAddress", tokenAddress);

	if (error) {
		console.error("Error fetching commodities:", error);
		return [];
	}

	return data;
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const country = searchParams.get("country");
	const consumerId = searchParams.get("consumerId");
	const tokenAddress = searchParams.get("tokenAddress");

	if (!consumerId || !country || !tokenAddress) {
		return NextResponse.json(
			{ error: "consumerId, country and tokenAddress are required" },
			{ status: 400 },
		);
	}

	try {
		const user = await getConsumerDetails(consumerId);
		if (!user) {
			return NextResponse.json({ error: "user not found" }, { status: 404 });
		}

		const ctfs = await fetchParticipantsWithLocations(ParticipantType.CTF);
		const eligibleCTFs = findTradingPartners(ctfs, user);

		const filteredCTFs = ctfs?.filter(
			(ctf) =>
				eligibleCTFs.includes(ctf.id) && isParticipantInCountry(ctf, country),
		);

		const filteredCTFIds = filteredCTFs.map((ctf) => ctf.id);
		const allCommodities = await getCommoditiesForParticipants(
			filteredCTFIds,
			tokenAddress,
		);

		// Count commodities by owner
		const commodityCounts = allCommodities.reduce(
			(acc, commodity) => {
				acc[commodity.currentOwnerId] =
					(acc[commodity.currentOwnerId] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const ctfsWithCommodities = filteredCTFs.map((partner) => ({
			partner,
			quantity: commodityCounts[partner.id] || 0,
		}));

		return NextResponse.json({
			options: ctfsWithCommodities,
			destination: getCountryNameFromAddress(user.locations?.[0].name),
		});
	} catch (error) {
		console.error("Error processing trade route request:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
