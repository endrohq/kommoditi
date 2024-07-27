"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
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

const { commodityExchange } = contracts;

export function CommodityItem({
	commodity,
	onListingChange,
	isListed,
}: CommodityListingProps) {
	const { writeToContract, isSuccess, isSubmitting } = usePublishTx({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: isListed ? "removeCommodity" : "approveCommodity",
		eventName: isListed ? "CommodityRemoved" : "CommodityApproved",
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
				<div className="space-x-1 flex items-center">
					{isListed ? (
						<>
							<CheckmarkFilled className="text-green-700" />
							<span className="text-sm font-medium text-green-700">
								Tradable
							</span>
						</>
					) : (
						<>
							<WarningFilled className="text-red-700" />
							<span className="text-sm font-medium text-red-700">Disabled</span>
						</>
					)}
				</div>
			</TableCell>
			<TableCell colSpan={8}>
				{isSubmitting ? (
					<div className="w-full flex">
						<LoadingOutlined />
					</div>
				) : (
					<div
						className={clsx("font-medium w-full cursor-pointer !text-sm", {
							"hover:text-blue-700": !isListed,
							"hover:text-red-700": isListed,
						})}
						onClick={() => writeToContract([commodity.tokenAddress])}
					>
						{isListed ? "Disable" : "Enable"} Trading
					</div>
				)}
			</TableCell>
		</TableRow>
	);
}
