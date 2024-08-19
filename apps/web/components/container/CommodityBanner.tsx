"use client";
import { CommodityToken } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { nFormatter } from "@/utils/number.utils";
import { getTokenPage } from "@/utils/route.utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";

type CommodityTokenWithPrice = CommodityToken & {
	price: number;
};

export function CommodityBanner() {
	const [contentWidth, setContentWidth] = useState(0);
	const contentRef = useRef<HTMLDivElement>(null);
	const { data, isLoading } = useQuery({
		queryKey: ["commodity-banner"],
		queryFn: () => fetchWrapper<CommodityTokenWithPrice[]>(`/api/tokens`),
		enabled: true,
	});

	useEffect(() => {
		if (contentRef.current) {
			setContentWidth(contentRef.current.offsetWidth);
		}
	}, [data]);

	if (isLoading || !data) return null;

	const scrollDuration = contentWidth / 25; // Adjust 50 to change scroll speed

	return (
		<div className="bg-orange-500 overflow-hidden whitespace-nowrap w-full">
			<div
				className="inline-block animate-scroll"
				style={{
					animationDuration: `${scrollDuration}s`,
					animationTimingFunction: "linear",
					animationIterationCount: "infinite",
				}}
			>
				<div ref={contentRef} className="inline-block py-1.5 px-5">
					{data.map((i, index) => (
						<React.Fragment key={i.symbol}>
							<span className="text-sm text-center text-orange-950">
								<Link
									className="font-bold underline"
									href={getTokenPage(i.tokenAddress)}
								>
									{i.symbol}
								</Link>
								:{" "}
								{i.price ? (
									<span className="font-medium">
										{nFormatter(i.price)} HBAR
									</span>
								) : (
									"N/A"
								)}
							</span>
							{index < data.length - 1 && (
								<span className="text-sm text-orange-700 mx-4">•</span>
							)}
						</React.Fragment>
					))}
				</div>
			</div>
		</div>
	);
}
