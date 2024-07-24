import { contracts } from "@/lib/constants";
import { Commodity, CommodityListing } from "@/typings";
import { useReadContract } from "wagmi";

const { tokenAuthority, commodityExchange } = contracts;

interface useCommoditiesReturnProps {
	commodities: Commodity[];
	isLoading: boolean;
	refetch(): void;
}

export function useCommodities(): useCommoditiesReturnProps {
	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading: isLoadingCommodities,
	} = useReadContract({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "getCommodityTokens",
	});

	const {
		data: listingsData,
		refetch: refetchListings,
		isLoading: isLoadingListings,
	} = useReadContract({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "getApprovedCommodities",
	});

	console.log(listingsData);

	const commodities = commoditiesData as Commodity[];
	const listings = listingsData as CommodityListing[];

	const isLoading = isLoadingCommodities || isLoadingListings;

	return {
		commodities: commodities?.map((commodity) => ({
			...commodity,
			isListed:
				listings?.find(
					(listing) => listing.tokenAddress === commodity.tokenAddress,
				)?.approved || false,
		})),
		isLoading,
		refetch: () => {
			refetchCommodities();
			refetchListings();
		},
	};
}
