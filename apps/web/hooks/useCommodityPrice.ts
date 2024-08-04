import { contracts } from "@/lib/constants";
import { EthAddress } from "@/typings";
import { parseSmToNumberFormat } from "@/utils/number.utils";
import { useReadContract } from "wagmi";

export function useCommodityPrice(poolAddress?: EthAddress) {
	const { data: currentPrice, isLoading: priceIsLoading } = useReadContract({
		address: poolAddress,
		abi: contracts.commodityPool.abi,
		functionName: "getCurrentPrice",
	});

	return {
		currentPrice: currentPrice ? Number(currentPrice) / 10e7 : 0,
		priceIsLoading,
	};
}
