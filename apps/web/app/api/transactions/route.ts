import supabase from "@/utils/supabase.utils";

import { networkId } from "@/lib/constants";
import { Participant, PoolTransaction } from "@/typings";
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

/*export type PoolTransaction = {
	type: PoolTransactionType;
	dateCreated: Date;
	transactionHash: EthAddress;
	from: EthAddress;
	to: EthAddress;
	value: string;
	blockNumber: bigint;
	blockHash: EthAddress;
	logArgs: Record<string, any>;
};*/

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
				blockHash: item.blockHash,
			},
			{ onConflict: "id" },
		)
		.select();

	if (transactionError) {
		console.error("Error inserting transaction:", transactionError);
		return false;
	}

	return true;
}
