"use client";

import { BuyModule } from "@/app/tokens/[address]/components/widget/BuyModule";
import ListCommodities from "@/app/tokens/[address]/components/widget/ListCommodities";
import { Button } from "@/components/button";
import { NumericInput } from "@/components/input/NumericInput";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityGroup, Region } from "@/typings";
import { getTokenPage } from "@/utils/route.utils";
import clsx from "clsx";
import Link from "next/link";
import React, { useEffect } from "react";
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
}

type Tab = "buy" | "list commodity" | "add liquidity";

export function TransactWidget({ address }: TransactWidgetProps) {
	const { account, isLoading } = useAuth();
	const [activeTab, setActiveTab] = React.useState<Tab>();

	useEffect(() => {
		if (account?.type === "PRODUCER") {
			setActiveTab("list commodity");
		} else {
			setActiveTab("buy");
		}
	}, [account?.type]);

	if (isLoading || !activeTab) {
		return (
			<>
				<div>
					<div className="flex items-center space-x-2 mb-4">
						<div className="px-8 py-3 rounded-full bg-gray-200 animate-pulse transition-all font-medium text-sm" />
						<div className="px-4 py-3 rounded-full bg-gray-200 animate-pulse transition-all font-medium text-sm" />
					</div>
				</div>
				<div className="bg-gray-200 animate-pulse rounded px-6 py-20  space-y-2" />
			</>
		);
	}

	const isProducer = account?.type === "PRODUCER";

	return (
		<>
			<div className="flex items-center space-x-2 mb-4">
				{isProducer && (
					<TransactWidgetMenuItem
						label="list commodity"
						setActiveTab={setActiveTab}
						activeTab={activeTab}
					/>
				)}
				{!isProducer && (
					<>
						<TransactWidgetMenuItem
							label="buy"
							setActiveTab={setActiveTab}
							activeTab={activeTab}
						/>
					</>
				)}
			</div>
			{isProducer ? (
				<>
					<ListCommodities />
				</>
			) : (
				<BuyModule />
			)}
		</>
	);
}
