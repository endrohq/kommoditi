import { contracts } from "@/lib/constants";
import { CommodityListingApproval, CommodityToken } from "@/typings";
import { useReadContract } from "wagmi";

const { commodityFactory } = contracts;

interface UseCommodityPoolsReturnProps {
	pools: string[];
	isLoading: boolean;
}

export function useCommodityPools(): UseCommodityPoolsReturnProps {
	const { data: poolAddresses, isLoading } = useReadContract({
		address: commodityFactory.address,
		abi: commodityFactory.abi,
		functionName: "getAllPools",
	});

	const data = poolAddresses as string[];

	return {
		pools: data,
		isLoading,
	};
}
