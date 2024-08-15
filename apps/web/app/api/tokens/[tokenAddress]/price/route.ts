import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const now = new Date();
	now.setMinutes(now.getMinutes() - (now.getMinutes() % 5), 0, 0); // Round to nearest 5-minute interval
	const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	// First, get the last known price before the 24-hour window
	const { data: lastKnownPriceData, error: lastKnownPriceError } =
		await supabase
			.from("commodityPrice")
			.select("createdAt, price")
			.eq("tokenAddress", params.tokenAddress)
			.lt("createdAt", twentyFourHoursAgo.toISOString())
			.order("createdAt", { ascending: false })
			.limit(1);

	const currentPrice =
		lastKnownPriceData && lastKnownPriceData.length > 0
			? lastKnownPriceData[0].price
			: null;

	if (lastKnownPriceError) {
		return NextResponse.json(
			{ error: lastKnownPriceError.message },
			{ status: 500 },
		);
	}

	// Then, get the data for the last 24 hours
	const { data: recentData, error: recentDataError } = await supabase
		.from("commodityPrice")
		.select("createdAt, price")
		.eq("tokenAddress", params.tokenAddress)
		.gte("createdAt", twentyFourHoursAgo.toISOString())
		.order("createdAt", { ascending: true });

	if (recentDataError) {
		return NextResponse.json(
			{ error: recentDataError.message },
			{ status: 500 },
		);
	}

	const history = processDataWithGapFilling(
		recentData,
		twentyFourHoursAgo,
		now,
		currentPrice,
	);

	return NextResponse.json({
		currentPrice,
		history,
	});
}

function processDataWithGapFilling(
	data: any[],
	start: Date,
	end: Date,
	initialPrice: number | null,
) {
	const processedData = [];
	const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
	let currentTime = new Date(start);
	let lastKnownPrice = initialPrice;

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
