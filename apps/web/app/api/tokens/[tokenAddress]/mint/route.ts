import { contracts, networkId } from "@/lib/constants";
import { getHederaAdminAccount, getHederaClient } from "@/utils/hedera.utils";
import supabase from "@/utils/supabase.utils";
import {
	AccountId,
	Hbar,
	PrivateKey,
	TokenId,
	TokenInfoQuery,
	TokenMintTransaction,
	TransactionRecordQuery,
} from "@hashgraph/sdk";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 10; // Adjust this value if needed

async function mintBatch(
	client: any,
	tokenId: TokenId,
	adminPrivKey: PrivateKey,
	batchSize: number,
) {
	const metadataArray = Array(batchSize)
		.fill(0)
		.map((_, index) => Buffer.from(`Metadata for NFT ${index + 1}`));

	const mintTx = new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata(metadataArray)
		.setMaxTransactionFee(new Hbar(20));

	const signedTx = await mintTx.freezeWith(client).sign(adminPrivKey);
	const mintTxResponse = await signedTx.execute(client);
	const record = await new TransactionRecordQuery()
		.setTransactionId(mintTxResponse.transactionId)
		.execute(client);

	if (record.receipt.status.toString() !== "SUCCESS") {
		throw new Error(`Minting failed with status: ${record.receipt.status}`);
	}

	return record.receipt.serials.map((serial) => serial.toNumber());
}

export async function POST(req: NextRequest) {
	try {
		const { tokenAddress, receiver, quantity } = await req.json();

		if (!tokenAddress || !receiver || !quantity) {
			return NextResponse.json(
				{ error: "tokenAddress, receiver, and quantity are required" },
				{ status: 400 },
			);
		}

		const { adminAccount, adminPrivKey } = await getHederaAdminAccount();
		const client = await getHederaClient();

		console.log(`Admin Account: ${adminAccount.toString()}`);
		console.log(`Token Address: ${tokenAddress}`);
		console.log(`Receiver: ${receiver}`);
		console.log(`Quantity: ${quantity}`);

		const tokenId = TokenId.fromSolidityAddress(tokenAddress);

		// Check token info and permissions
		const tokenInfo = await new TokenInfoQuery()
			.setTokenId(tokenId)
			.execute(client);

		console.log(`Token Info: ${JSON.stringify(tokenInfo)}`);
		console.log(`Supply Key: ${tokenInfo.supplyKey?.toString()}`);
		console.log(`Admin Key: ${adminPrivKey.publicKey.toString()}`);

		if (tokenInfo.supplyKey?.toString() !== adminPrivKey.publicKey.toString()) {
			throw new Error(
				"Admin account does not have the supply key for this token",
			);
		}

		let allSerialNumbers: number[] = [];
		let remainingQuantity = quantity;

		while (remainingQuantity > 0) {
			const batchSize = Math.min(remainingQuantity, BATCH_SIZE);
			console.log(`Minting batch of ${batchSize} NFTs...`);
			const batchSerialNumbers = await mintBatch(
				client,
				tokenId,
				adminPrivKey,
				batchSize,
			);
			allSerialNumbers = allSerialNumbers.concat(batchSerialNumbers);
			remainingQuantity -= batchSize;
			console.log(`Minted ${batchSerialNumbers.length} NFTs in this batch.`);
		}

		console.log(`Total minted NFTs: ${allSerialNumbers.length}`);
		console.log(`Minted serial numbers: ${allSerialNumbers.join(", ")}`);

		return NextResponse.json({
			success: true,
			serialNumbers: allSerialNumbers,
			mintStatus: "SUCCESS",
			totalMinted: allSerialNumbers.length,
		});
	} catch (error: any) {
		console.error("Error minting NFT:", error);
		return NextResponse.json(
			{
				error: "Failed to mint NFT",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 },
		);
	}
}
