import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const now = new Date();
	now.setMinutes(now.getMinutes() - (now.getMinutes() % 5), 0, 0); // Round to nearest 5-minute interval
	const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	const { data, error } = await supabase
		.from("commodityPrice")
		.select("createdAt, price")
		.eq("tokenAddress", params.tokenAddress)
		.gte("createdAt", twentyFourHoursAgo.toISOString())
		.order("createdAt", { ascending: true });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const processedData = processDataWithGapFilling(
		data || [],
		twentyFourHoursAgo,
		now,
	);

	return NextResponse.json(processedData);
}

function processDataWithGapFilling(data: any[], start: Date, end: Date) {
	const processedData = [];
	const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
	let currentTime = new Date(start);
	let lastKnownPrice = null;

	let dataIndex = 0;

	while (currentTime <= end) {
		const timeString = currentTime.toISOString();

		// Find the next data point that matches or exceeds the current time
		while (
			dataIndex < data.length &&
			new Date(data[dataIndex].createdAt) <= currentTime
		) {
			lastKnownPrice = data[dataIndex].price;
			dataIndex++;
		}

		processedData.push({
			timestamp: timeString,
			price: lastKnownPrice,
		});

		currentTime = new Date(currentTime.getTime() + interval);
	}

	return processedData;
}
