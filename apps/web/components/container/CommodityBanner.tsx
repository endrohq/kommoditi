"use client";

import { CommodityToken } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { getTokenPage } from "@/utils/route.utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { ReactNode } from "react";

type CommodityTokenWithPrice = CommodityToken & {
	price: number;
};

export function CommodityBanner() {
	const { data, isLoading } = useQuery({
		queryKey: ["commodity-banner"],
		queryFn: () => fetchWrapper<CommodityTokenWithPrice[]>(`/api/tokens`),
		enabled: true,
		refetchInterval: 10000, // 10 seconds
	});

	if (isLoading) {
		return <></>;
	}

	return (
		<div className="bg-orange-500 flex items-center py-1.5 px-5 w-full space-x-4">
			{data?.map((i) => (
				<>
					<div key={i.symbol} className="text-sm text-center text-orange-950">
						<Link
							className="font-bold underline"
							href={getTokenPage(i.tokenAddress)}
						>
							{i.symbol}
						</Link>
						:{" "}
						{i.price ? (
							<span className="font-medium">{i.price} HBAR</span>
						) : (
							"N/A"
						)}
					</div>
					<div className="text-sm text-orange-700">•</div>
				</>
			))}
		</div>
	);
}
