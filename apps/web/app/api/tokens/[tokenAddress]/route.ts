import { NextRequest, NextResponse } from "next/server";

import { getHederaClient } from "@/utils/hedera.utils";
import { TokenId, TokenInfoQuery } from "@hashgraph/sdk";

export async function GET(
	req: NextRequest,
	{ params }: { params: { tokenAddress: string } },
) {
	const client = await getHederaClient();

	const tokenId = TokenId.fromSolidityAddress(params.tokenAddress);
	const query = new TokenInfoQuery().setTokenId(tokenId);
	const tokenInfo = await query.execute(client);

	const response = {
		name: tokenInfo.name,
		symbol: tokenInfo.symbol,
	};

	return NextResponse.json(response);
}
