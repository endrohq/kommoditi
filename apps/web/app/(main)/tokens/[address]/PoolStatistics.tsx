"use client";

import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { formatNumber } from "@/utils/number.utils";
import React from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";

function Statistic({ value, label }: { label: string; value: string }) {
	return (
		<div>
			<div className="text-xs text-gray-500 font-medium">{label}</div>
			<div className="font-bold text-base">{value}</div>
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
		<div className="mt-6 py-4 mb-4 bg-gray-50 rounded px-4 !border-gray-200 grid grid-cols-5">
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
