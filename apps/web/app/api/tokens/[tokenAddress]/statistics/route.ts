import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const [{ data: distributors }, { data: producers }] = await Promise.all([
		supabase
			.from("distributorPurchase")
			.select("distributorId")
			.eq("tokenAddress", params.tokenAddress)
			.returns<{ producerId: string }[]>(),
		supabase
			.from("listing")
			.select("producerId")
			.eq("tokenAddress", params.tokenAddress)
			.returns<{ producerId: string }[]>(),
	]);
	const uniqueDistributors = new Set(distributors?.map((d) => d.producerId));
	const uniqueProducers = new Set(producers?.map((p) => p.producerId));
	return NextResponse.json({
		distributors: uniqueDistributors.size,
		producers: uniqueProducers.size,
	});
}
