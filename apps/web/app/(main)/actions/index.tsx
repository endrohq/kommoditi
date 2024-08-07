"use server";

import { CommodityToken } from "@/typings";
import supabase from "@/utils/supabase.utils";

export async function loadCommodities(): Promise<CommodityToken[] | null> {
	const { data: commodities, error } = await supabase
		.from("commodities")
		.select("*");

	return commodities;
}
