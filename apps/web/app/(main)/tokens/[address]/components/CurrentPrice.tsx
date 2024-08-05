import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { useReadContract } from "wagmi";

export function CurrentPrice() {
	const { commodity } = useTokenPage();
	const { data } = useReadContract({
		address: commodity?.poolAddress,
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
