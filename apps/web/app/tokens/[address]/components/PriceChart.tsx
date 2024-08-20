"use client";

import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityPricePoint } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { AreaChart, AreaChartOptions, ScaleTypes } from "@carbon/charts-react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import "@carbon/charts/styles.css";
import { nFormatter } from "@/utils/number.utils";
import { format } from "date-fns";

type PriceEndpointResult = {
	currentPrice: number;
	history: CommodityPricePoint[];
};

export function PriceChart() {
	const { commodity } = useTokenPage();
	const [displayedPrice, setDisplayedPrice] = React.useState<number>();

	const { data, isLoading } = useQuery({
		queryKey: [`priceChart-${commodity?.tokenAddress}`],
		queryFn: async () =>
			fetchWrapper<PriceEndpointResult>(
				`/api/tokens/${commodity?.tokenAddress}/price`,
			),
	});

	const currentPrice = data?.currentPrice || 0;
	const history = data?.history || [];

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
				ticks: {
					number: 5,
					// @ts-ignore
					formatter: (timestamp: number) => {
						const date = new Date(timestamp);
						return format(date, "h:mm a");
					},
				},
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
				enabled: false,
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
			// @ts-ignore
			customHTML: (datapoint: any[]) => {
				if (
					datapoint[0] &&
					datapoint[0].price !== null &&
					displayedPrice != datapoint[0].price
				) {
					setDisplayedPrice(datapoint[0].price);
				}
				return null; // Return an empty string to hide the default tooltip
			},
		},
		legend: {
			enabled: false,
		},
		events: {
			mouseLeave: () => {
				setDisplayedPrice(undefined);
			},
		},
	};

	const currentDisplayedPrice = displayedPrice ? displayedPrice : currentPrice;

	const formattedPrice = currentDisplayedPrice
		? nFormatter(currentDisplayedPrice, 7)
		: currentDisplayedPrice;

	return (
		<>
			<div className="mb-4">
				<div className="text-xs text-gray-600">
					Price in <span className="font-semibold">HBAR</span>
				</div>
				<div className="text-2xl font-black text-black">
					{isLoading ? "-" : formattedPrice}
				</div>
			</div>
			{isLoading ? (
				<div className="h-[250px] bg-gray-100 rounded flex items-center justify-center">
					<span className="text-xs text-gray-500">LOADING</span>
				</div>
			) : (
				<AreaChart data={history} options={chartOptions} />
			)}
		</>
	);
}
