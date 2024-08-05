"use client";

import { contracts } from "@/lib/constants";
import {
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
} from "@/typings";
import { parseCommodities } from "@/utils/parser.utils";
import { createContext, useContext, useMemo } from "react";
import { useReadContract } from "wagmi";

interface CommoditiesContextProps {
	commodities: CommodityToken[];
	isLoading: boolean;
}

export const CommoditiesContext = createContext<CommoditiesContextProps>({
	commodities: [],
	isLoading: false,
});

export function useCommodities() {
	return useContext(CommoditiesContext);
}

export function CommoditiesProvider({
	children,
}: { children: React.ReactNode }) {
	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading: isLoadingCommodityData,
	} = useReadContract({
		address: contracts.tokenAuthority.address,
		abi: contracts.tokenAuthority.abi,
		functionName: "getCommodities",
	});

	const {
		data: poolData,
		refetch: refetchPoolData,
		isLoading: isLoadingPoolData,
	} = useReadContract({
		address: contracts.commodityFactory.address,
		abi: contracts.commodityFactory.abi,
		functionName: "getAllPools",
	});

	const tokens = commoditiesData as GetCommodityResponse[];
	const pools = poolData as GetAllPoolsResponse[];

	const values = useMemo(
		() => ({
			commodities: parseCommodities(tokens, pools),
			isLoading: isLoadingCommodityData || isLoadingPoolData,
			refetch: () => {
				refetchCommodities();
				refetchPoolData();
			},
		}),
		[tokens, pools, isLoadingCommodityData, isLoadingPoolData],
	);

	return (
		<CommoditiesContext.Provider value={values}>
			{children}
		</CommoditiesContext.Provider>
	);
}
