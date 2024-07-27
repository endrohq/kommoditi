"use client";

import { LiquidityProvider } from "@/app/tokens/[address]/LiquidityProvider";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useCommodity } from "@/hooks/useCommodity";
import { getTokenPage } from "@/utils/route.utils";
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

	if (!commodity) {
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
				<div className="font-medium flex items-center space-x-4 !text-indigo-900">
					<div className="bg-gray-300 w-8 aspect-square rounded-full" />
					<span className="text-xl font-bold">
						{commodity.token.name} ({commodity.token.symbol})
					</span>
				</div>
				<div className="py-20 mt-10 bg-gray-200 rounded w-full" />
			</div>
			<div className="w-4/12">
				<LiquidityProvider commodity={commodity} />
			</div>
		</Content>
	);
}
