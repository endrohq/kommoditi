import { fetchParticipantsWithLocations } from "@/app/(main)/actions";
import { ParticipantType, ParticipantUserView, Region } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { findTradingPartners } from "@/utils/overlap.utils"; // Adjust the import path as needed
import supabase from "@/utils/supabase.utils"; // Adjust the import path as needed
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

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const country = searchParams.get("country");
	const consumerId = searchParams.get("consumerId");

	if (!consumerId || !country) {
		return NextResponse.json(
			{ error: "consumerId and country are required" },
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

		return NextResponse.json({
			ctfs: ctfs?.filter(
				(ctf) =>
					eligibleCTFs.includes(ctf.id) && isParticipantInCountry(ctf, country),
			),
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
