import { contracts } from "@/lib/constants";
import {
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
	HederaToken,
} from "@/typings";
import { useReadContract } from "wagmi";

const { tokenAuthority, commodityExchange, commodityFactory } = contracts;

interface useCommoditiesReturnProps {
	commodities: CommodityToken[];
	isLoading: boolean;
	refetch(): void;
}

export function useCommodities(): useCommoditiesReturnProps {
	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading: isLoadingCommodityData,
	} = useReadContract({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "getCommodities",
	});

	const {
		data: poolData,
		refetch: refetchPoolData,
		isLoading: isLoadingPoolData,
	} = useReadContract({
		address: commodityFactory.address,
		abi: commodityFactory.abi,
		functionName: "getAllPools",
	});

	const tokens = commoditiesData as GetCommodityResponse[];
	const pools = poolData as GetAllPoolsResponse[];

	return {
		commodities: (tokens || [])?.map(({ tokenInfo, tokenAddress }) => ({
			...tokenInfo,
			tokenAddress,
			poolAddress: pools?.find((pool) => pool.tokenAddress === tokenAddress)
				?.poolAddress,
		})),
		isLoading: isLoadingCommodityData || isLoadingPoolData,
		refetch: () => {
			refetchCommodities();
			refetchPoolData();
		},
	};
}
