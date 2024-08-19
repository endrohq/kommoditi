"use client";

import { TokenStatistics } from "@/app/tokens/[address]/TokenStatistics";
import { useTokenPage } from "@/providers/TokenPageProvider";
import React from "react";

export function TokenPageHeader() {
	const { commodity } = useTokenPage();

	if (!commodity) {
		return <></>;
	}

	return (
		<div className="!z-[999] layout flex flex-col -pt-2">
			<div
				style={{ marginTop: "-60px" }}
				className="bg-white w-full rounded px-10 pt-10"
			>
				<div
					style={{ borderBottom: "1px solid #eee" }}
					className="pb-6 w-full flex items-center justify-between"
				>
					<div className="gap-2 flex flex-col">
						<span className="text-2xl text-indigo-900 leading-normal font-bold">
							{commodity.name}
						</span>
						<span className="text-sm -mt-1.5 font-medium text-gray-700">
							Ticker: <span className="font-medium">{commodity.symbol}</span>
						</span>
					</div>
					<TokenStatistics />
				</div>
			</div>
		</div>
	);
}
