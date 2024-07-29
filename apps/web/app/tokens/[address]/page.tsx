"use client";

import { CurrentPrice } from "@/app/tokens/[address]/CurrentPrice";
import { LiquidityDistribution } from "@/app/tokens/[address]/LiquidityDistribution";
import { LiquidityProvider } from "@/app/tokens/[address]/LiquidityProvider";
import { Listings } from "@/app/tokens/[address]/Listings";
import { PoolStatistics } from "@/app/tokens/[address]/PoolStatistics";
import { TransactionList } from "@/app/tokens/[address]/PoolTransactions";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useCommodity } from "@/hooks/useCommodity";
import { Content } from "@carbon/react";
import React from "react";

interface Props {
	params: {
		address: string;
	};
}

export default function Page({ params }: Props) {
	const { commodity, isLoading } = useCommodity({
		address: params.address,
	});

	if (isLoading) {
		return (
			<Content className="px-56">
				<div className="w-full flex justify-center">
					<LoadingOutlined />
				</div>
			</Content>
		);
	}

	if (!commodity || !commodity?.poolAddress) {
		return (
			<Content className="px-56">
				<div className="w-full flex justify-center">
					<p>Commodity not found</p>
				</div>
			</Content>
		);
	}

	return (
		<Content className="px-56 flex items-start space-x-10">
			<div className="w-8/12">
				<Breadcrumbs
					crumbs={[
						{ label: "Commodities" },
						{
							label: commodity.token.name,
							href: `/tokens/${commodity.tokenAddress}`,
						},
					]}
				/>
				<div className="mt-4 flex items-center justify-between">
					<div className="font-medium  flex items-center space-x-4 text-indigo-900">
						<div className="bg-gray-300 w-8 aspect-square rounded-full" />
						<span className="text-xl font-bold">
							{commodity.token.name} ({commodity.token.symbol})
						</span>
					</div>
					<CurrentPrice address={commodity?.poolAddress} />
				</div>
				<LiquidityDistribution address={commodity?.poolAddress} />
				<PoolStatistics commodity={commodity} />
				<div className="gap-10 flex flex-col mt-10">
					<Listings poolAddress={commodity?.poolAddress} />
					<TransactionList poolAddress={commodity?.poolAddress} />
				</div>
			</div>
			<div className="w-4/12">
				<LiquidityProvider commodity={commodity} />
			</div>
		</Content>
	);
}
