import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import {
	CommodityStatus,
	ConsumerPurchased,
	DistributorPurchased,
	ListingAdded,
	PoolTransaction,
	PriceUpdated,
} from "@/typings";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const { data: transactions, error } = await supabase
			.from("transaction")
			.select("*")
			.eq("chainId", networkId);

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
				.eq("chainId", networkId)
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
	const { error: listingError } = await supabase
		.from("listing")
		.insert({
			id: event.listingId,
			producerId: event.producerId,
			createdAt: event.createdAt,
			transactionHash: event.transactionHash,
			tokenAddress: event.tokenAddress,
			chainId: networkId,
		})
		.single();

	if (listingError) throw listingError;

	const commodities = event.serialNumbers.map((serialNumber) => ({
		id: serialNumber,
		producerId: event.producerId,
		listingId: event.listingId,
		status: CommodityStatus.LISTED,
		currentOwnerId: event.producerId,
		tokenAddress: event.tokenAddress,
		chainId: networkId,
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
		chainId: networkId,
	});

	if (error) throw error;
}

async function handleDistributorPurchase(event: DistributorPurchased) {
	// Update Distributor price
	const { error: distributorError } = await supabase
		.from("distributorPurchase")
		.insert({
			tokenAddress: event.tokenAddress,
			transactionHash: event.transactionHash,
			distributorId: event.distributorId,
			listingId: event.listingId,
			price: event.price,
			totalPrice: event.totalPrice,
			chainId: networkId,
		});

	if (distributorError) throw distributorError;

	// Update commodities
	const { error: commoditiesError } = await supabase
		.from("commodity")
		.update({
			status: CommodityStatus.PURCHASED_BY_DISTRIBUTOR,
			currentOwnerId: event.distributorId,
		})
		.in("id", event.serialNumbers)
		.eq("chainId", networkId);

	if (commoditiesError) throw commoditiesError;
}

async function handleConsumerPurchase(event: ConsumerPurchased) {
	// Update Distributor price
	const { error: consumerError } = await supabase
		.from("consumerPurchase")
		.insert({
			tokenAddress: event.tokenAddress,
			transactionHash: event.transactionHash,
			distributorId: event.distributorId,
			consumerId: event.consumerId,
			price: event.price,
			totalPrice: event.totalPrice,
			chainId: networkId,
		});

	if (consumerError) throw consumerError;

	// Update commodities
	const { error: commoditiesError } = await supabase
		.from("commodity")
		.update({
			status: CommodityStatus.PURCHASED_BY_CONSUMER,
			currentOwnerId: event.consumerId,
		})
		.in("id", event.serialNumbers)
		.eq("chainId", networkId);

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
			case "DistributorPurchased":
				await handleDistributorPurchase(event as DistributorPurchased);
				break;
			case "ConsumerPurchased":
				await handleConsumerPurchase(event as ConsumerPurchased);
				break;
			default:
				console.error(`Unsupported event type: ${event.type}`);
				break;
		}
	}

	return true;
}
