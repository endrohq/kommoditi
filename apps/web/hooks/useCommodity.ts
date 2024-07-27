import { contracts } from "@/lib/constants";
import { CommodityToken, GetAllPoolsResponse, HederaToken } from "@/typings";
import { useReadContract } from "wagmi";

const { tokenAuthority, commodityFactory } = contracts;

interface useCommodityReturnProps {
	commodity?: CommodityToken;
	isLoading: boolean;
	refetch(): void;
}

interface UseCommodityProps {
	address: string;
}

export function useCommodity({
	address,
}: UseCommodityProps): useCommodityReturnProps {
	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading: isLoadingCommodityData,
	} = useReadContract({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "getTokenInfo",
		args: [address],
	});

	const {
		data: poolData,
		refetch: refetchPoolData,
		isLoading: isLoadingPoolData,
	} = useReadContract({
		address: commodityFactory.address,
		abi: commodityFactory.abi,
		functionName: "getPoolByToken",
		args: [address],
	});

	const token = commoditiesData as HederaToken;
	const pool = poolData as string;

	const commodity =
		token && pool
			? ({
					...token,
					tokenAddress: address,
					poolAddress: poolData,
				} as CommodityToken)
			: undefined;

	// Filter out commodities that are not tradable (should not have pool address) if isTradable is true
	return {
		commodity,
		isLoading: isLoadingCommodityData || isLoadingPoolData,
		refetch: () => {
			refetchCommodities();
			refetchPoolData();
		},
	};
}
