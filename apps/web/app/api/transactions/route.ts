import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import {
	CTFPurchase,
	LiquidityChanged,
	ListingAdded,
	Participant,
	PoolTransaction,
	PoolTransactionType,
	PriceUpdated,
} from "@/typings";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { data: transactions, error } = await supabase
			.from("transaction")
			.select("*");

		if (error) {
			console.error("Error fetching transactions:", error);
			return new NextResponse("Error fetching transactions", { status: 500 });
		}

		return NextResponse.json(transactions);
	} catch (error) {
		console.error("Error fetching transactions:", error);
		return new NextResponse("Error fetching transactions", { status: 500 });
	}
}

export async function POST(req: NextRequest, res: NextResponse) {
	try {
		const data = await req.json();

		for (const item of data) {
			// Find the transaction in the database
			const { data: transaction } = await supabase
				.from("transaction")
				.select("*")
				.eq("id", item.id)
				.single();

			if (!transaction) {
				const isUpserted = await upsertTransaction(item);
				if (!isUpserted) {
					return new NextResponse("Error inserting transaction", {
						status: 500,
					});
				}
			} else {
				console.log("transaction already exists");
			}
		}
		return NextResponse.json({ message: "Data inserted successfully" });
	} catch (error) {
		console.error("Error processing request:", error);
		return new NextResponse("Error processing request", { status: 500 });
	}
}

async function handleListingAdded(event: ListingAdded) {
	// Insert the listing
	const { data: listing, error: listingError } = await supabase
		.from("listing")
		.insert({
			id: event.listingId,
			producerId: event.producer,
			createdAt: event.createdAt,
			transactionHash: event.transactionHash,
			tokenAddress: event.tokenAddress,
		})
		.single();

	if (listingError) throw listingError;

	// Insert or update commodities
	const commodities = event.serialNumbers.map((serialNumber) => ({
		id: serialNumber,
		producerId: event.producer,
		listingId: event.listingId,
		status: "listed",
		currentOwnerId: event.producer,
		tokenAddress: event.tokenAddress,
	}));

	const { error: commoditiesError } = await supabase
		.from("commodity")
		.upsert(commodities, { onConflict: "id" });

	if (commoditiesError) throw commoditiesError;
}

async function handlePriceUpdated(event: PriceUpdated) {
	const { error } = await supabase.from("commodityPrice").insert({
		tokenAddress: event.tokenAddress,
		transactionHash: event.transactionHash,
		price: event.price,
	});

	if (error) throw error;
}

/*
async function handleLiquidityChanged(event: LiquidityChanged) {
	const { error } = await supabase.from("liquidity_pools").upsert(
		{
			ctfId: event.ctf,
			amount: event.isAdding
				? supabase.raw("amount + ?", [event.amount])
				: supabase.raw("amount - ?", [event.amount]),
			minPrice: event.minPrice,
			maxPrice: event.maxPrice,
		},
		{ onConflict: "ctfId" },
	);

	if (error) throw error;
}
*/

async function handleCTFPurchase(event: CTFPurchase) {
	// Update CTF price
	const { error: ctfError } = await supabase.from("ctfPurchase").insert({
		tokenAddress: event.tokenAddress,
		transactionHash: event.transactionHash,
		ctf: event.ctf,
		listingId: event.listingId,
		price: event.price,
		totalPrice: event.totalPrice,
	});

	if (ctfError) throw ctfError;

	// Update commodities
	const { error: commoditiesError } = await supabase
		.from("commodity")
		.update({ status: "purchased", currentOwnerId: event.ctf })
		.in("id", event.serialNumbers);

	if (commoditiesError) throw commoditiesError;
}

async function upsertTransaction(item: PoolTransaction) {
	const { error: transactionError } = await supabase
		.from("transaction")
		.upsert(
			{
				id: item.id,
				chainId: networkId,
				createdAt: item.createdAt,
				from: item.from,
				to: item.to,
				value: item.value,
				blockNumber: item.blockNumber,
			},
			{ onConflict: "id" },
		)
		.select();

	if (transactionError) {
		console.error("Error inserting transaction:", transactionError);
		return false;
	}

	if (!item.events) {
		return true;
	}

	for (const event of item.events) {
		console.log(event);

		switch (event.type) {
			case "ListingAdded":
				await handleListingAdded(event as ListingAdded);
				break;
			case "PriceUpdated":
				await handlePriceUpdated(event as PriceUpdated);
				break;
			/*case "LiquidityChanged":
				await handleLiquidityChanged(event as LiquidityChanged);
				break;
			*/
			case "CTFPurchase":
				await handleCTFPurchase(event as CTFPurchase);
				break;
			default:
				console.error(`Unsupported event type: ${event.type}`);
				break;
		}
	}

	return true;
}
