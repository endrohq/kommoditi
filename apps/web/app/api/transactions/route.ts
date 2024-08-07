// app/actions/syncCommodities.ts
"use server";

import { CommodityToken } from "@/typings";
import supabase from "@/utils/supabase.utils";

export async function syncCommoditiesToServer(commodities: CommodityToken[]) {
	const { data, error } = await supabase
		.from("commodities")
		.upsert(commodities, {
			onConflict: "id", // Assuming 'id' is the unique identifier for commodities
			ignoreDuplicates: false, // Set to true if you want to ignore duplicates
		});

	if (error) {
		console.error("Error syncing commodities:", error);
		throw error;
	}

	return data;
}
