"use client";

import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { formatNumber } from "@/utils/number.utils";
import React from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";

function Statistic({ value, label }: { label: string; value: string }) {
	return (
		<div className="text-right">
			<div className="text-xs text-gray-500 font-medium">{label}</div>
			<div className="font-bold text-sm ">{value}</div>
		</div>
	);
}

export function PoolStatistics() {
	const { commodity } = useTokenPage();

	const { data: liquidityData, error } = useReadContract({
		address: commodity?.poolAddress,
		abi: contracts.commodityPool.abi,
		functionName: "getTotalLiquidity",
	});
	return (
		<div className="flex items-center space-x-12 mr-4">
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
