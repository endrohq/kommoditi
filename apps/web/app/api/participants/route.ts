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
		// Check if location already exists
		const { data: existingLocation, error: checkLocationError } = await supabase
			.from("location")
			.select("id")
			.eq("name", location.name)
			.single();

		if (checkLocationError && checkLocationError.code !== "PGRST116") {
			console.error("Error checking location:", checkLocationError);
			return false;
		}

		let locationId: string;

		if (existingLocation) {
			locationId = existingLocation.id;
		} else {
			// Insert new location
			const { data: newLocation, error: insertLocationError } = await supabase
				.from("location")
				.insert({ name: location.name })
				.select()
				.single();

			if (insertLocationError) {
				console.error("Error inserting location:", insertLocationError);
				return false;
			}

			locationId = newLocation.id;

			// Upsert h3Indexes
			for (const h3Index of location.h3Indexes) {
				const { error: h3IndexError } = await supabase.from("h3Index").upsert({
					locationId: locationId,
					h3Index: h3Index,
				});

				if (h3IndexError) {
					console.error("Error upserting h3Index:", h3IndexError);
					return false;
				}
			}
		}

		// Upsert participant_location relation
		const { error: relationError } = await supabase
			.from("participant_location")
			.upsert({
				participantId: item.id,
				locationId: locationId,
			});

		if (relationError) {
			console.error(
				"Error upserting participant_location relation:",
				relationError,
			);
			return false;
		}
	}

	return true;
}
