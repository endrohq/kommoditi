import { CommodityPricePoint, PriceUpdated } from "@/typings";
import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const now = new Date();
	now.setMinutes(now.getMinutes() - (now.getMinutes() % 5), 0, 0); // Round to nearest 5-minute interval
	const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	// Get all price entries for the last 24 hours
	const { data: recentData, error: recentDataError } = await supabase
		.from("commodityPrice")
		.select("createdAt, price")
		.eq("tokenAddress", params.tokenAddress)
		.gte("createdAt", twentyFourHoursAgo.toISOString())
		.lte("createdAt", now.toISOString())
		.order("createdAt", { ascending: true })
		.returns<PriceUpdated[]>();

	if (recentDataError) {
		return NextResponse.json(
			{ error: recentDataError.message },
			{ status: 500 },
		);
	}

	let currentPrice: number | null = null;
	let history: CommodityPricePoint[] = [];

	if (recentData && recentData.length > 0) {
		currentPrice = recentData[recentData.length - 1].price;
		history = processDataWithGapFilling(recentData, twentyFourHoursAgo, now);
	} else {
		// If no data in the last 24 hours, check for the most recent price before that
		const { data: lastKnownPriceData, error: lastKnownPriceError } =
			await supabase
				.from("commodityPrice")
				.select("createdAt, price")
				.eq("tokenAddress", params.tokenAddress)
				.lt("createdAt", twentyFourHoursAgo.toISOString())
				.order("createdAt", { ascending: false })
				.limit(1)
				.returns<PriceUpdated[]>();

		if (lastKnownPriceError) {
			return NextResponse.json(
				{ error: lastKnownPriceError.message },
				{ status: 500 },
			);
		}

		if (lastKnownPriceData && lastKnownPriceData.length > 0) {
			currentPrice = lastKnownPriceData[0].price;
			history = generateStaticHistory(currentPrice, twentyFourHoursAgo, now);
		}
	}

	return NextResponse.json({
		currentPrice,
		history,
	});
}

function processDataWithGapFilling(
	data: PriceUpdated[],
	start: Date,
	end: Date,
): CommodityPricePoint[] {
	const processedData: CommodityPricePoint[] = [];
	const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
	let currentTime = new Date(start);
	let dataIndex = 0;
	let lastKnownPrice: number | null = null;

	while (currentTime <= end) {
		const timeString = currentTime.toISOString();
		let price: number | null = null;

		// Find the latest data point that falls within or before this 5-minute interval
		while (
			dataIndex < data.length &&
			new Date(data[dataIndex].createdAt) <= currentTime
		) {
			price = data[dataIndex].price;
			lastKnownPrice = price;
			dataIndex++;
		}

		// If no price found for this interval, use the last known price
		if (price === null && lastKnownPrice !== null) {
			price = lastKnownPrice;
		}

		processedData.push({
			timestamp: timeString,
			price: price,
		});

		currentTime = new Date(currentTime.getTime() + interval);
	}

	return processedData;
}

function generateStaticHistory(
	price: number,
	start: Date,
	end: Date,
): CommodityPricePoint[] {
	const staticData: CommodityPricePoint[] = [];
	const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
	let currentTime = new Date(start);

	while (currentTime <= end) {
		staticData.push({
			timestamp: currentTime.toISOString(),
			price: price,
		});
		currentTime = new Date(currentTime.getTime() + interval);
	}

	return staticData;
}
