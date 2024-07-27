"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { TradingStatus } from "@/components/status";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { CommodityToken } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { CheckmarkFilled, WarningFilled } from "@carbon/icons-react";
import { TableCell, TableRow } from "@carbon/react";
import clsx from "clsx";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface CommodityListingProps {
	commodity: CommodityToken;
	isListed: boolean;
	onListingChange(): void;
}

const { commodityExchange, commodityFactory } = contracts;

export function CommodityItem({
	commodity,
	onListingChange,
	isListed,
}: CommodityListingProps) {
	const { writeToContract, isSuccess, isSubmitting } = usePublishTx({
		address: commodityFactory.address,
		abi: commodityFactory.abi,
		functionName: "createPool",
		eventName: "PoolCreated",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success(`Commodity ${isListed ? "disabled" : "enabled"}`);
			onListingChange();
		}
	}, [isSuccess]);

	return (
		<TableRow>
			<TableCell className="font-medium !text-indigo-900" colSpan={4}>
				{commodity.token.name} ({commodity.token.symbol})
			</TableCell>
			<TableCell colSpan={4}>
				{getShortenedFormat(commodity.tokenAddress)}
			</TableCell>
			<TableCell colSpan={4}>
				{getShortenedFormat(commodity.poolAddress) || "-"}
			</TableCell>
			<TableCell colSpan={8}>
				{isSubmitting ? (
					<div className="w-full flex">
						<LoadingOutlined />
					</div>
				) : (
					!commodity?.poolAddress && (
						<>
							{/*<div
						className={clsx("font-medium w-full cursor-pointer !text-sm", {
							"hover:text-blue-700": !isListed,
							"hover:text-red-700": isListed,
						})}
						onClick={() => writeToContract([commodity.tokenAddress])}
					>
						{isListed ? "Disable" : "Enable"} Trading
					</div>*/}
							<div
								className={clsx("font-medium w-full cursor-pointer !text-sm", {
									"hover:text-blue-700": !isListed,
									"hover:text-red-700": isListed,
								})}
								onClick={() => writeToContract([commodity.tokenAddress])}
							>
								Create Liquidity Pool
							</div>
						</>
					)
				)}
			</TableCell>
		</TableRow>
	);
}
