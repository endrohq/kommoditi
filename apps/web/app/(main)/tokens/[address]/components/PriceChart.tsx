"use client";

import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityPricePoint } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { AreaChart, AreaChartOptions, ScaleTypes } from "@carbon/charts-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import "@carbon/charts/styles.css";

interface PriceChartProps {
	currentPrice?: number;
}

export function PriceChart({ currentPrice = 1 }: PriceChartProps) {
	const { commodity } = useTokenPage();
	const { data, isLoading } = useQuery({
		queryKey: [`priceChart-${commodity?.tokenAddress}`],
		queryFn: async () =>
			fetchWrapper<CommodityPricePoint[]>(
				`/api/tokens/${commodity?.tokenAddress}/price`,
			),
	});

	console.log(data);

	const chartOptions: AreaChartOptions = {
		experimental: true,
		timeScale: {
			addSpaceOnEdges: 0,
		},
		axes: {
			bottom: {
				mapsTo: "timestamp",
				scaleType: ScaleTypes.TIME,
				includeZero: false,
			},
			left: {
				mapsTo: "price",
				scaleType: ScaleTypes.LINEAR,
				includeZero: false,
			},
		},
		height: "250px",
		color: {
			scale: {
				price: "#00D1B5",
			},
		},
		points: {
			enabled: false,
		},
		grid: {
			x: {
				enabled: true,
			},
			y: {
				enabled: true,
			},
		},
		toolbar: {
			enabled: false,
		},
		tooltip: {
			enabled: true,
		},
		legend: {
			enabled: false,
		},
	};

	return <AreaChart data={data || []} options={chartOptions} />;
}
