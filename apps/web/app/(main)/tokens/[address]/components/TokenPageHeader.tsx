"use client";

import { PoolStatistics } from "@/app/(main)/tokens/[address]/PoolStatistics";
import { useTokenPage } from "@/providers/TokenPageProvider";
import React from "react";

export function TokenPageHeader() {
	const { commodity } = useTokenPage();

	if (!commodity) {
		return <></>;
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<div className=" flex items-center space-x-8">
					<div className="gap-1.5 flex ">
						<span className="text-2xl text-indigo-900  font-bold">
							{commodity.name}
						</span>
						<span className="text-sm -mt-1.5 font-semibold text-gray-400">
							({commodity.symbol})
						</span>
					</div>
				</div>
				<PoolStatistics />
			</div>
		</>
	);
}
