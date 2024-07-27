import { contracts } from "@/lib/constants";
import {
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
} from "@/typings";
import { parseCommodities } from "@/utils/parser.utils";
import { useReadContract } from "wagmi";

const { tokenAuthority, commodityExchange, commodityFactory } = contracts;

interface useCommoditiesReturnProps {
	commodities: CommodityToken[];
	isLoading: boolean;
	refetch(): void;
}

interface UseCommoditiesProps {
	isTradable?: boolean;
}

export function useCommodities({
	isTradable,
}: UseCommoditiesProps): useCommoditiesReturnProps {
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

	// Filter out commodities that are not tradable (should not have pool address) if isTradable is true
	return {
		commodities: parseCommodities(tokens, pools)?.filter((token) =>
			isTradable ? token.poolAddress : true,
		),
		isLoading: isLoadingCommodityData || isLoadingPoolData,
		refetch: () => {
			refetchCommodities();
			refetchPoolData();
		},
	};
}
