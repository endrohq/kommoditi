"use client";

import { PoolStatistics } from "@/app/(main)/tokens/[address]/PoolStatistics";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCommodityPrice } from "@/hooks/useCommodityPrice";
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
					<div className="bg-gray-300 w-12 aspect-square rounded-l-sm rounded-r" />
					<span className="text-base text-indigo-900 font-bold">
						{commodity.name} ({commodity.symbol})
					</span>
				</div>
				<PoolStatistics />
			</div>
		</>
	);
}
