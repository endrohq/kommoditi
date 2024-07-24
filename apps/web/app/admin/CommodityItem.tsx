"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { Commodity } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { CheckmarkFilled, WarningFilled } from "@carbon/icons-react";
import { TableCell, TableRow } from "@carbon/react";
import clsx from "clsx";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface CommodityListingProps {
	commodity: Commodity;
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
			<TableCell>{commodity.symbol}</TableCell>
			<TableCell>{getShortenedFormat(commodity.tokenAddress)}</TableCell>
			<TableCell>
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
					<div></div>
				</div>
			</TableCell>
			<TableCell>
				<div
					className={clsx("font-medium cursor-pointer text-right !text-sm", {
						"hover:text-blue-700": !isListed,
						"hover:text-red-700": isListed,
					})}
					onClick={() => writeToContract([commodity.tokenAddress])}
				>
					{isSubmitting ? (
						<LoadingOutlined />
					) : (
						<span>{isListed ? "Disable" : "Enable"} Trading</span>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
}
