import {
	convertEthAddressToAccountId,
	getHederaAdminAccount,
	getHederaClient,
	transferNFTs,
} from "@/utils/hedera.utils";
import { AccountId, TokenId } from "@hashgraph/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { tokenAddress, fromAddress, toAddress, serialNumbers } =
			await req.json();

		if (
			!tokenAddress ||
			!fromAddress ||
			!toAddress ||
			!serialNumbers ||
			!serialNumbers.length
		) {
			return NextResponse.json(
				{
					error:
						"tokenAddress, fromAddress, toAddress, and serialNumbers are required",
				},
				{ status: 400 },
			);
		}

		const { adminPrivKey } = await getHederaAdminAccount();
		const client = await getHederaClient();

		const tokenId = TokenId.fromSolidityAddress(tokenAddress);
		const fromAccountId = await convertEthAddressToAccountId(
			client,
			fromAddress,
		);
		const toAccountId = await convertEthAddressToAccountId(client, toAddress);

		if (!fromAccountId || !toAccountId) {
			throw new Error("Failed to convert addresses to AccountIds");
		}

		// Transfer NFTs
		await transferNFTs(
			client,
			tokenId,
			fromAccountId,
			toAccountId,
			serialNumbers,
			adminPrivKey,
		);

		return NextResponse.json({
			success: true,
			message: "NFTs transferred successfully",
			transferredSerialNumbers: serialNumbers,
		});
	} catch (error: any) {
		console.error("Error transferring NFTs:", error);
		return NextResponse.json(
			{
				error: "Failed to transfer NFTs",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 },
		);
	}
}
