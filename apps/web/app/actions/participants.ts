"use server";

import { networkId } from "@/lib/constants";
import { CommodityToken, Participant, ParticipantProfile } from "@/typings";
import supabase from "@/utils/supabase.utils";

export async function getParticipant(
	address: string,
): Promise<ParticipantProfile> {
	const { data: participant, error } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.eq("id", address)
		.eq("chainId", networkId)
		.single<Participant>();

	if (error) {
		return {} as ParticipantProfile;
	}

	const { data: commodities } = await supabase
		.from("commodity")
		.select("tokenAddress")
		.eq("currentOwnerId", address)
		.eq("chainId", networkId)
		.returns<{ tokenAddress: string }[]>();

	const { data: tokens } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("chainId", networkId)
		.returns<CommodityToken[]>();

	// group commodities by id and count the amount of tokens in possession with default value of 0

	const commodityCount = commodities?.reduce(
		(acc, commodity) => {
			acc[commodity.tokenAddress] = (acc[commodity.tokenAddress] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return {
		account: participant,
		tokens:
			tokens?.map((token) => ({
				token,
				amount: commodityCount?.[token.tokenAddress] || 0,
			})) || [],
	};
}
