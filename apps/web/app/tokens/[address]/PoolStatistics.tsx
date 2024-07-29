import { contracts } from "@/lib/constants";
import { CommodityToken, EthAddress } from "@/typings";
import { formatNumber } from "@/utils/number.utils";
import React from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";

interface StatisticsProps {
	poolAddress: EthAddress;
	commodity: CommodityToken;
}

function Statistic({ value, label }: { label: string; value: string }) {
	return (
		<div>
			<div className="text-sm text-gray-500 font-medium">{label}</div>
			<div className="font-bold text-lg">{value}</div>
		</div>
	);
}

export function PoolStatistics({ poolAddress, commodity }: StatisticsProps) {
	const { data: liquidityData, error } = useReadContract({
		address: poolAddress,
		abi: contracts.commodityPool.abi,
		functionName: "getTotalLiquidity",
	});
	return (
		<div className="pt-10 pb-4 grid grid-cols-4">
			<Statistic
				label="TVL"
				value={`${
					liquidityData
						? formatNumber(formatEther(liquidityData as bigint))
						: "-"
				} HBAR`}
			/>
			<Statistic
				label="Total Supply"
				value={formatNumber(commodity?.totalSupply)}
			/>
		</div>
	);
}
