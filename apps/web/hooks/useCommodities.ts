import { contracts } from "@/lib/constants";
import { CommodityToken, GetCommodityResponse, HederaToken } from "@/typings";
import { useReadContract } from "wagmi";

const { tokenAuthority, commodityExchange } = contracts;

interface useCommoditiesReturnProps {
	commodities: CommodityToken[];
	isLoading: boolean;
	refetch(): void;
}

export function useCommodities(): useCommoditiesReturnProps {
	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading,
	} = useReadContract({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "getCommodities",
	});

	/*const {
		data: listingsData,
		refetch: refetchListings,
		isLoading: isLoadingListings,
	} = useReadContract({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "getApprovedCommodities",
	});*/

	const tokens = commoditiesData as GetCommodityResponse[];
	// const listings = listingsData as CommodityListingApproval[];

	return {
		commodities: (tokens || [])?.map(({ tokenInfo, tokenAddress }) => ({
			...tokenInfo,
			tokenAddress,
		})),
		isLoading,
		refetch: () => {
			refetchCommodities();
		},
	};
}
