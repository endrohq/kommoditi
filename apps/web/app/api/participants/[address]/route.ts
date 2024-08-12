import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	_: NextRequest,
	{ params }: { params: { address: string } },
) {
	try {
		const { data: participant, error } = await supabase
			.from("participant")
			.select("*")
			.eq("id", params.address)
			.single<Participant>();

		if (error) {
			console.error(`Error fetching participant ${params.address}:`, error);
			return new NextResponse(`Error fetching participant ${params.address}`, {
				status: 500,
			});
		}

		return NextResponse.json(participant);
	} catch (error) {
		console.error(`Error fetching participant ${params.address}:`, error);
		return new NextResponse(`Error fetching participant ${params.address}`, {
			status: 500,
		});
	}
}
