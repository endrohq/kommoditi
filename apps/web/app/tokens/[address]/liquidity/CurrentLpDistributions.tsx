import { TimeWindowOverlay } from "@/app/tokens/[address]/liquidity/TimeWindowOverlay";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityPoolLiquidity } from "@/typings";
import { processPriceDistribution } from "@/utils/price.utils";
import { formatLpLiquidities } from "@/utils/transaction.utils";
import { AreaChart, AreaChartOptions, ScaleTypes } from "@carbon/charts-react";
import React, { useMemo } from "react";
import { useReadContract } from "wagmi";
import "@carbon/charts/styles.css";

interface CurrentLpDistributionsProps {
	setMinPrice: (min: number) => void;
	setMaxPrice: (max: number) => void;
	maxPrice: number;
	minPrice: number;
	currentPrice: number;
}

export function CurrentLpDistributions({
	setMinPrice,
	setMaxPrice,
	maxPrice,
	minPrice,
	currentPrice,
}: CurrentLpDistributionsProps) {
	const { commodity } = useTokenPage();

	const { data: distributorLiquidityData, isLoading } = useReadContract({
		address: commodity?.poolAddress,
		abi: contracts.commodityPool.abi,
		functionName: "getAllDistributorLiquidity",
	});

	const distributorLiquidity = useMemo(() => {
		if (!distributorLiquidityData) return [];
		return formatLpLiquidities(
			distributorLiquidityData as CommodityPoolLiquidity[],
		);
	}, [distributorLiquidityData]);

	const distributorPriceDistributionDataSet = useMemo(() => {
		if (!distributorLiquidity) return [];
		return processPriceDistribution(distributorLiquidity);
	}, [distributorLiquidity]);

	const [globalMinPrice, globalMaxPrice] = useMemo(() => {
		if (!distributorLiquidity) return [1, 2];
		const min = Math.min(
			...distributorLiquidity.map((distributor) => distributor.minPrice),
		);
		const max = Math.max(
			...distributorLiquidity.map((distributor) => distributor.maxPrice),
		);
		return [min === Infinity ? 0 : min, max === -Infinity ? 1 : max];
	}, [distributorLiquidity]);

	const chartOptions: AreaChartOptions = {
		axes: {
			bottom: {
				mapsTo: "price",
				scaleType: ScaleTypes.LINEAR,
				includeZero: false,
				thresholds: [
					{
						value: currentPrice,
						label: "Current Price",
						valueFormatter: (v) => `${v} HBAR`,
						fillColor: "#006dff",
					},
				],
			},
			left: {
				visible: false,
				mapsTo: "liquidity",
				scaleType: ScaleTypes.LINEAR,
			},
		},
		toolbar: {
			enabled: false,
		},
		curve: "curveMonotoneX",
		height: "250px",
		grid: {
			x: {
				alignWithAxisTicks: true,
				enabled: false,
			},
		},
		color: {
			scale: {
				liquidity: "#0062ff",
			},
		},
		points: {
			enabled: false,
		},
		tooltip: {
			enabled: false,
		},
		legend: {
			enabled: false,
		},
		width: "100%",
	};

	if (isLoading) {
		return (
			<div className="bg-gray-200 animate-pulse rounded h-[150px] w-full place-content-center text-center">
				<LoadingOutlined />
			</div>
		);
	}

	if (!distributorPriceDistributionDataSet.length && !isLoading) {
		return (
			<div className="bg-gray-300 rounded h-[150px] w-full place-content-center text-center">
				<span className="text-sm text-gray-400 w-7/12">
					No liquidity found. Freely choose a min & max price
				</span>
			</div>
		);
	}

	return (
		<div className="!w-full relative">
			<AreaChart
				data={distributorPriceDistributionDataSet}
				options={chartOptions}
			/>
			<TimeWindowOverlay
				minPrice={minPrice}
				maxPrice={maxPrice}
				globalMinPrice={globalMinPrice}
				globalMaxPrice={globalMaxPrice}
				onRangeChange={(min, max) => {
					setMinPrice(min);
					setMaxPrice(max);
				}}
			/>
		</div>
	);
}
