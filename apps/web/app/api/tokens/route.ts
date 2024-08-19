import { contracts, networkId } from "@/lib/constants";
import { CommodityToken } from "@/typings";
import supabase from "@/utils/supabase.utils";
import { NextRequest, NextResponse } from "next/server";

import { getHederaAdminAccount, getHederaClient } from "@/utils/hedera.utils";
import {
	TokenCreateTransaction,
	TokenId,
	TokenSupplyType,
	TokenType,
} from "@hashgraph/sdk";

type CommodityTokenWithPrice = CommodityToken & {
	price: number;
};

export async function GET() {
	const { data: commodityTokens, error: tokenError } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("chainId", networkId)
		.returns<CommodityToken[]>();

	if (!commodityTokens) return NextResponse.json([]);

	let mergedData: CommodityTokenWithPrice[] = [];
	for (const token of commodityTokens) {
		const { data: latestPrice, error: priceError } = await supabase
			.from("commodityPrice")
			.select("*")
			.eq("tokenAddress", token.tokenAddress)
			.eq("chainId", networkId)
			.order("createdAt", { ascending: false })
			.limit(1);

		mergedData.push({ ...token, price: latestPrice?.[0]?.price || 0 });
	}

	return NextResponse.json(mergedData || []);
}

export async function POST(req: NextRequest) {
	try {
		const { name, symbol } = await req.json();

		if (!name || !symbol) {
			return NextResponse.json(
				{ error: "Name and symbol are required" },
				{ status: 400 },
			);
		}

		const { adminPrivKey, adminAccount } = await getHederaAdminAccount();
		const client = await getHederaClient();

		const createTokenTx = new TokenCreateTransaction()
			.setTokenName(name)
			.setTokenSymbol(symbol)
			.setTokenType(TokenType.NonFungibleUnique)
			.setSupplyType(TokenSupplyType.Finite)
			.setInitialSupply(0)
			.setMaxSupply(1000000)
			.setTreasuryAccountId(adminAccount)
			.setAdminKey(adminPrivKey.publicKey)
			.setSupplyKey(adminPrivKey.publicKey)
			.setFreezeDefault(false);

		const tokenTxResponse = await createTokenTx.execute(client);
		const tokenRx = await tokenTxResponse.getReceipt(client);
		const tokenId = tokenRx.tokenId!;
		const tokenAddress = TokenId.fromString(
			tokenId.toString(),
		).toSolidityAddress();

		return NextResponse.json({
			success: true,
			tokenId: tokenId.toString(),
			tokenAddress,
		});
	} catch (error: any) {
		console.error("Error creating token:", error);
		return NextResponse.json(
			{
				error: "Failed to create token",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 },
		);
	}
}
