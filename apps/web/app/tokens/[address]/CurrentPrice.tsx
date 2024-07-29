import { contracts } from "@/lib/constants";
import { EthAddress } from "@/typings";
import { useReadContract } from "wagmi";

interface CurrentPriceProps {
	address: EthAddress;
}

export function CurrentPrice({ address }: CurrentPriceProps) {
	const { data, error } = useReadContract({
		address: address,
		abi: contracts.commodityPool.abi,
		functionName: "getCurrentPrice",
	});

	return (
		<div className="text-right">
			<div className="text-xs text-gray-600">Current Price</div>
			<div className="text-2xl font-black text-black">${data?.toString()}</div>
		</div>
	);
}
