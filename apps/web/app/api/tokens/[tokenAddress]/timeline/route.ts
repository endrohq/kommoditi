import { networkId } from "@/lib/constants";
import { getHederaClient } from "@/utils/hedera.utils";
import supabase from "@/utils/supabase.utils";
import { TransactionRecordQuery } from "@hashgraph/sdk";
import { NextRequest, NextResponse } from "next/server";

async function getHederaTransactionRecord(ethTxHash: string) {
	const client = await getHederaClient();

	try {
		const txRecord = await new TransactionRecordQuery()
			.setTransactionId(ethTxHash)
			.execute(client);

		return txRecord.transactionId.toString() || "";
	} catch (error) {
		console.error("Error fetching transaction record:", error);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const { error: tokenError } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("tokenAddress", params.tokenAddress?.toLowerCase())
		.eq("chainId", networkId)
		.single();

	if (tokenError) {
		console.error("Error fetching token:", tokenError);
		return NextResponse.json([]);
	}

	const { data: listings, error: listingError } = await supabase
		.from("listing")
		.select("*,producer:producerId(*), transaction:transactionHash(*)")
		.eq("tokenAddress", params.tokenAddress?.toLowerCase())
		.eq("chainId", networkId);

	if (listingError) {
		console.error("Error fetching listings:", listingError);
		return NextResponse.json([]);
	}

	const { data: distributorPurchases, error: distributorPurchaseError } =
		await supabase
			.from("distributorPurchase")
			.select("*,distributor:distributorId(*),transaction:transactionHash(*)")
			.eq("tokenAddress", params.tokenAddress)
			.eq("chainId", networkId);

	if (distributorPurchaseError) {
		console.error(
			"Error fetching distributor purchases:",
			distributorPurchaseError,
		);
		return NextResponse.json([]);
	}

	const { data: consumerPurchases, error: consumerPurchaseError } =
		await supabase
			.from("consumerPurchase")
			.select("*,consumer:consumerId(*),transaction:transactionHash(*)")
			.eq("tokenAddress", params.tokenAddress)
			.eq("chainId", networkId);

	if (consumerPurchaseError) {
		console.error("Error fetching consumer purchases:", consumerPurchaseError);
		return NextResponse.json([]);
	}

	const events = [
		...listings.map((l) => ({
			type: "listing",
			...l,
		})),
		...distributorPurchases.map((p) => ({
			type: "distributorPurchase",
			...p,
		})),
		...consumerPurchases.map((p) => ({
			type: "consumerPurchase",
			...p,
		})),
	].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	for (const event of events) {
		if (event.transaction?.hash)
			event.transactionHash = await getHederaTransactionRecord(
				event.transaction?.hash,
			);
	}

	return NextResponse.json(events || []);
}
