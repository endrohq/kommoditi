import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import { CommodityToken } from "@/typings";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { data: commodities, error } = await supabase
			.from("commodityToken")
			.select("*")
			.eq("chainId", networkId);

		if (error) {
			console.error("Error fetching commodities:", error);
			return new NextResponse("Error fetching commodities", { status: 500 });
		}

		return NextResponse.json(commodities);
	} catch (error) {
		console.error("Error fetching commodities:", error);
		return new NextResponse("Error fetching commodities", { status: 500 });
	}
}

export async function POST(req: NextRequest, res: NextResponse) {
	try {
		const bodyInput = await req.json();
		const commodities = bodyInput.map((item: CommodityToken) => ({
			...item,
			tokenAddress: item.tokenAddress.toLowerCase(),
			chainId: networkId,
		}));

		const { data, error } = await supabase
			.from("commodityToken")
			.upsert(commodities, {
				onConflict: "tokenAddress", // Assuming 'id' is the unique identifier for commodities
				ignoreDuplicates: false, // Set to true if you want to ignore duplicates
			});

		if (error) {
			console.error("Error storing commodities:", error);
			return new NextResponse("Error storing commodities", { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error storing transactions:", error);
		return new NextResponse("Error storing transactions", { status: 500 });
	}
}
