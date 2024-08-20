import { networkId } from "@/lib/constants";
import { ParticipantUserView, PlaceType, Region } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const { data: commodities, error } = await supabase
		.from("listing")
		.select("producerId")
		.eq("chainId", networkId)
		.eq("tokenAddress", params.tokenAddress);

	if (error) {
		console.error("Error fetching commodities:", error);
		throw new Error("Failed to fetch commodities");
	}

	const producerIds: string[] = Array.from(
		new Set(commodities.map((c) => c.producerId)),
	);

	const { data: producers } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.in("id", producerIds)
		.eq("chainId", networkId)
		.returns<ParticipantUserView[]>();

	const countryNames = (producers || [])
		.map((producer) => {
			const location = producer?.locations?.[0] as Region; // Assuming the first location is the primary one
			return getCountryNameFromAddress(location.name);
		})
		?.filter((c) => !!c || c !== null);

	const countries = Array.from(new Set(countryNames)).map(
		(c) =>
			({
				id: c,
				name: c,
				locationType: PlaceType.COUNTRY,
				centerLng: 0,
				centerLat: 0,
			}) as Region,
	);

	return NextResponse.json(countries || []);
}
