import { contracts } from "@/lib/constants";
import { EthAddress } from "@/typings";
import { useReadContract } from "wagmi";
import "@carbon/charts/styles.css";
import { AreaChart, AreaChartOptions, ScaleTypes } from "@carbon/charts-react";
import { useMemo } from "react";
import { formatEther } from "viem";

interface CurrentPriceProps {
	address: EthAddress;
}

interface CommodityPoolLiquidity {
	ctf: string;
	minPrice: number;
	maxPrice: number;
	amount: number;
}

export function LiquidityDistribution({ address }: CurrentPriceProps) {
	const { data: liquidityData, isLoading } = useReadContract({
		address: address,
		abi: contracts.commodityPool.abi,
		functionName: "getAllCTFLiquidity",
	});

	function processPriceDistribution(
		ctfLiquidities: CommodityPoolLiquidity[],
		steps: number = 50,
	) {
		if (ctfLiquidities.length === 0) return [];

		const minPrice = Math.min(...ctfLiquidities.map((ctf) => ctf.minPrice));
		const maxPrice = Math.max(...ctfLiquidities.map((ctf) => ctf.maxPrice));

		const range = maxPrice - minPrice;
		const stepSize = range / steps;

		const distribution = [];

		for (let i = 0; i <= steps; i++) {
			const price = minPrice + i * stepSize;
			let totalLiquidity = 0;

			for (const ctf of ctfLiquidities) {
				if (price >= ctf.minPrice && price <= ctf.maxPrice) {
					const liquidityAtPrice = ctf.amount / (ctf.maxPrice - ctf.minPrice);
					totalLiquidity += liquidityAtPrice;
				}
			}

			distribution.push({
				price: parseFloat(price.toFixed(2)),
				liquidity: parseFloat(totalLiquidity.toFixed(2)),
			});
		}

		return distribution;
	}

	const ctfLiquidity: CommodityPoolLiquidity[] = (liquidityData as any[])?.map(
		(item) => ({
			ctf: item.ctf,
			minPrice: Number(item.minPrice),
			maxPrice: Number(item.maxPrice),
			amount: Number(formatEther(item.amount)),
		}),
	);

	const chartData = useMemo(() => {
		if (!ctfLiquidity) return [];
		return processPriceDistribution(ctfLiquidity);
	}, [ctfLiquidity]);

	const minPrice = Math.min(...chartData.map((d) => d.price));
	const maxPrice = Math.max(...chartData.map((d) => d.price));

	const chartOptions: AreaChartOptions = {
		title: "Liquidity Distribution by Price Range",
		axes: {
			bottom: {
				title: "Price (HBAR)",
				mapsTo: "price",
				scaleType: ScaleTypes.LINEAR,
				domain: [minPrice, maxPrice],
				includeZero: false,
			},
			left: {
				title: "Liquidity",
				mapsTo: "liquidity",
				scaleType: ScaleTypes.LINEAR,
			},
		},
		curve: "curveMonotoneX",
		height: "400px",
		width: "100%",
		color: {
			scale: {
				liquidity: "#0062ff",
			},
		},
		legend: {
			enabled: false,
		},
		points: {
			enabled: false,
		},
		toolbar: {
			enabled: false,
		},
	};

	if (isLoading) {
		return <></>;
	}

	return (
		<div className="w-full">
			<AreaChart data={chartData} options={chartOptions} />
		</div>
	);
}
