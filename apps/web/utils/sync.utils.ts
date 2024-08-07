import { chainOptions, contracts } from "@/lib/constants";
import { GetAllPoolsResponse, GetCommodityResponse } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { parseCommodities } from "@/utils/parser.utils";
import { readContracts } from "@wagmi/core";

export async function getCommoditiesFromClient(chainId: number) {
	try {
		const [{ result: commoditiesData }, { result: poolData }] =
			await readContracts(chainOptions, {
				contracts: [
					{
						address: contracts.tokenAuthority.address,
						abi: contracts.tokenAuthority.abi,
						functionName: "getCommodities",
					},
					{
						address: contracts.commodityFactory.address,
						abi: contracts.commodityFactory.abi,
						functionName: "getAllPools",
					},
				],
			});
		const tokens = commoditiesData as GetCommodityResponse[];
		const pools = poolData as GetAllPoolsResponse[];
		const parsedCommodities = parseCommodities(tokens, pools, chainId);
		await fetchWrapper<any>("/api/commodities", {
			method: "POST",
			body: JSON.stringify(parsedCommodities),
		});
	} catch (error) {
		console.error("Error fetching stored commodities:", error);
	}
}

export async function getTransactions(lastBlockNumber: number) {
	try {
		const data = await readContracts(chainOptions, {
			contracts: [],
		});
		console.log(data);
	} catch (error) {
		console.error("Error fetching stored transactions:", error);
	}
}
