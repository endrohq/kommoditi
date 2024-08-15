import { CommodityToken } from "@/typings";
import supabase from "@/utils/supabase.utils";
import { NextResponse } from "next/server";

type CommodityTokenWithPrice = CommodityToken & {
	price: number;
};

export async function GET() {
	const { data: commodityTokens, error: tokenError } = await supabase
		.from("commodityToken")
		.select("*")
		.returns<CommodityToken[]>();

	if (!commodityTokens) return NextResponse.json([]);

	let mergedData: CommodityTokenWithPrice[] = [];
	for (const token of commodityTokens) {
		const { data: latestPrice, error: priceError } = await supabase
			.from("commodityPrice")
			.select("*")
			.eq("tokenAddress", token.tokenAddress)
			.order("createdAt", { ascending: false })
			.limit(1);

		mergedData.push({ ...token, price: latestPrice?.[0]?.price || 0 });
	}

	return NextResponse.json(mergedData || []);
}
