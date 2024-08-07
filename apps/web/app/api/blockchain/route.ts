import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import { BlockchainConfig } from "@/typings";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { data: config, error } = await supabase
			.from("blockchain")
			.select("*")
			.eq("id", networkId)
			.single();

		if (error) {
			await saveConfig({ id: networkId, blockNumber: 0 });
			return NextResponse.json(0);
		}

		return NextResponse.json(config.blockNumber || 0);
	} catch (error) {
		return NextResponse.json({});
	}
}

export async function POST(req: NextRequest) {
	try {
		const config = await req.json();

		const insertData = { ...config, id: networkId };

		const { data, error } = await supabase
			.from("blockchain")
			.upsert(insertData, {
				onConflict: "id",
				ignoreDuplicates: false,
			});

		if (error) {
			console.error("Error storing config:", error);
			return new NextResponse("Error storing config", { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error storing config:", error);
		return new NextResponse("Error storing config", { status: 500 });
	}
}

async function saveConfig(config: BlockchainConfig) {
	const { data, error } = await supabase.from("blockchain").upsert(config, {
		onConflict: "id",
		ignoreDuplicates: false,
	});

	if (error) {
		console.error("Error storing config:", error);
		return false;
	}

	return true;
}
