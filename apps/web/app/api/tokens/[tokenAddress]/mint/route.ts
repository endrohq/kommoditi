import {
	associateToken,
	convertEthAddressToAccountId,
	getHederaAdminAccount,
	getHederaClient,
	mintNFTs,
	setAllowanceForAdmin,
	transferNFTs,
} from "@/utils/hedera.utils";
import { AccountId, TokenId } from "@hashgraph/sdk";
import { NextRequest, NextResponse } from "next/server";

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

		const tokenId = TokenId.fromSolidityAddress(tokenAddress);
		console.log(receiver);
		const receiverAccountId = await convertEthAddressToAccountId(
			client,
			receiver,
		);
		if (!receiverAccountId) {
			throw new Error("Failed to convert receiver address to AccountId");
		}

		// Mint NFTs
		const serialNumbers = await mintNFTs(
			client,
			tokenId,
			adminPrivKey,
			quantity,
		);

		// Transfer NFTs to receiver (producer)
		await transferNFTs(
			client,
			tokenId,
			adminAccount,
			receiverAccountId,
			serialNumbers,
			adminPrivKey,
		);

		return NextResponse.json({
			success: true,
			serialNumbers: serialNumbers,
			mintStatus: "SUCCESS",
			transferStatus: "SUCCESS",
			allowanceStatus: "SUCCESS",
			totalMinted: serialNumbers.length,
		});
	} catch (error: any) {
		console.error(
			"Error in minting, transferring, and setting allowance:",
			error,
		);
		return NextResponse.json(
			{
				error: "Failed to complete the NFT minting and setup process",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 },
		);
	}
}
