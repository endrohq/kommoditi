"use client";

import { BuyModule } from "@/app/(main)/tokens/[address]/components/widget/BuyModule";
import { Button } from "@/components/button";
import { NumericInput } from "@/components/input/NumericInput";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityGroup, Region } from "@/typings";
import { getTokenPage } from "@/utils/route.utils";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import Select from "react-select";

interface TransactWidgetMenuItemProps {
	label: Tab;
	activeTab: Tab;
	setActiveTab?: (tab: Tab) => void;
}

function TransactWidgetMenuItem({
	label,
	setActiveTab,
	activeTab,
}: TransactWidgetMenuItemProps) {
	return (
		<div
			onClick={() => setActiveTab?.(label)}
			className={clsx(
				"px-3 py-1.5 rounded-full transition-all font-medium text-sm",
				{
					"bg-indigo-200 text-indigo-800": activeTab === label,
					"text-gray-500 hover:text-indigo-800": activeTab !== label,
				},
			)}
		>
			{label}
		</div>
	);
}

interface TransactWidgetProps {
	address: string;
	availableCountries?: Region[];
	activeCommoditiesByRegion: CommodityGroup[];
}

type Tab = "buy" | "add liquidity";

export function TransactWidget({
	address,
	availableCountries,
	activeCommoditiesByRegion,
}: TransactWidgetProps) {
	const [activeTab, setActiveTab] = React.useState<Tab>("buy");

	return (
		<>
			<div className="flex items-center space-x-2 mb-4">
				<TransactWidgetMenuItem
					label="buy"
					setActiveTab={setActiveTab}
					activeTab={activeTab}
				/>

				<Link href={`${getTokenPage(address)}/liquidity`}>
					<TransactWidgetMenuItem activeTab={activeTab} label="add liquidity" />
				</Link>
			</div>
			<BuyModule
				commodityGroup={activeCommoditiesByRegion}
				availableCountries={availableCountries}
			/>
		</>
	);
}
