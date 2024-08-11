import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import { Participant } from "@/typings";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { data: participants, error } = await supabase
			.from("participant")
			.select("*");

		if (error) {
			console.error("Error fetching participants:", error);
			return new NextResponse("Error fetching participants", { status: 500 });
		}

		return NextResponse.json(participants);
	} catch (error) {
		console.error("Error fetching participants:", error);
		return new NextResponse("Error fetching participants", { status: 500 });
	}
}

export async function POST(req: NextRequest, res: NextResponse) {
	try {
		const data = await req.json();

		for (const item of data) {
			// Find the participant in the database
			const { data: participant } = await supabase
				.from("participant")
				.select("*")
				.eq("id", item.id)
				.single();

			if (!participant) {
				const isUpserted = await upsertParticipant(item);
				if (!isUpserted) {
					return new NextResponse("Error inserting participant", {
						status: 500,
					});
				}
			} else {
				console.log("Participant already exists");
			}
		}
		return NextResponse.json({ message: "Data inserted successfully" });
	} catch (error) {
		console.error("Error processing request:", error);
		return new NextResponse("Error processing request", { status: 500 });
	}
}

async function upsertParticipant(item: Participant) {
	// Upsert participant
	const { error: participantError } = await supabase
		.from("participant")
		.upsert(
			{
				id: item.id,
				name: item.name,
				overheadPercentage: item.overheadPercentage,
				type: item.type,
				chainId: networkId,
			},
			{ onConflict: "id" },
		)
		.select();

	if (participantError) {
		console.error("Error upserting participant:", participantError);
		return false;
	}

	for (const location of item.locations) {
		let locationId: string;

		// Insert new location
		const { data: newLocation, error: insertLocationError } = await supabase
			.from("location")
			.insert({
				id: location.id,
				name: location.name,
				locationType: location.locationType,
				centerLng: location.centerLng / 1000000,
				centerLat: location.centerLat / 1000000,
				participant_id: item.id,
			})
			.select()
			.single();

		if (insertLocationError) {
			console.error("Error inserting location:", insertLocationError);
			return false;
		}
	}

	return true;
}
