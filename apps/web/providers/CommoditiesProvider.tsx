"use client";

import { contracts } from "@/lib/constants";
import {
	CommodityToken,
	GetAllPoolsResponse,
	GetCommodityResponse,
} from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { parseCommodities } from "@/utils/parser.utils";
import { createContext, useContext, useEffect, useState } from "react";
import { useReadContract } from "wagmi";

interface CommoditiesContextProps {
	commodities: CommodityToken[];
	isLoading: boolean;
	refetch: () => void;
}

export const CommoditiesContext = createContext<CommoditiesContextProps>({
	commodities: [],
	isLoading: false,
	refetch: () => {},
});

export function useCommodities() {
	return useContext(CommoditiesContext);
}

export function CommoditiesProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [commodities, setCommodities] = useState<CommodityToken[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [shouldFetchClientSide, setShouldFetchClientSide] = useState(false);

	const {
		data: commoditiesData,
		refetch: refetchCommodities,
		isLoading: isLoadingCommodityData,
	} = useReadContract({
		address: contracts.tokenAuthority.address,
		abi: contracts.tokenAuthority.abi,
		functionName: "getCommodities",
		query: {
			enabled: shouldFetchClientSide,
		},
	});

	const {
		data: poolData,
		refetch: refetchPoolData,
		isLoading: isLoadingPoolData,
	} = useReadContract({
		address: contracts.commodityFactory.address,
		abi: contracts.commodityFactory.abi,
		functionName: "getAllPools",
		query: {
			enabled: shouldFetchClientSide,
		},
	});

	useEffect(() => {
		async function loadCommodities() {
			setIsLoading(true);
			try {
				const data = await fetchWrapper<CommodityToken[]>("/api/commodities");
				if (data.length > 0) {
					setCommodities(data);
					setIsLoading(false);
					return;
				}
				// If we reach here, it means there are no stored commodities
				setShouldFetchClientSide(true);
			} catch (error) {
				console.error("Error fetching stored commodities:", error);
				setShouldFetchClientSide(true);
			}
		}

		loadCommodities();
	}, []);

	useEffect(() => {
		if (shouldFetchClientSide && commoditiesData && poolData) {
			const tokens = commoditiesData as GetCommodityResponse[];
			const pools = poolData as GetAllPoolsResponse[];
			const parsedCommodities = parseCommodities(tokens, pools);
			setCommodities(parsedCommodities);
			syncCommoditiesToServer(parsedCommodities);
			setIsLoading(false);
		}
	}, [shouldFetchClientSide, commoditiesData, poolData]);

	async function syncCommoditiesToServer(commoditiesToSync: CommodityToken[]) {
		try {
			const response = await fetch("/api/commodities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(commoditiesToSync),
			});

			if (!response.ok) {
				throw new Error("Failed to sync commodities");
			}
		} catch (error) {
			console.error("Error syncing commodities:", error);
		}
	}

	const refetch = async () => {
		setIsLoading(true);
		setShouldFetchClientSide(false);
		// First, try to fetch from the server
		try {
			const response = await fetch("/api/commodities");
			if (response.ok) {
				const storedCommodities = await response.json();
				if (storedCommodities.length > 0) {
					setCommodities(storedCommodities);
					setIsLoading(false);
					return;
				}
			}
		} catch (error) {
			console.error("Error fetching stored commodities during refetch:", error);
		}
		// If server fetch fails or returns no data, fall back to client-side fetching
		setShouldFetchClientSide(true);
		await refetchCommodities();
		await refetchPoolData();
	};

	return (
		<CommoditiesContext.Provider
			value={{
				commodities,
				isLoading:
					isLoading ||
					(shouldFetchClientSide &&
						(isLoadingCommodityData || isLoadingPoolData)),
				refetch,
			}}
		>
			{children}
		</CommoditiesContext.Provider>
	);
}
