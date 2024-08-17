"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import {
	CommodityGroup,
	CommodityPurchasePrice,
	Participant,
	ParticipantQuantity,
	ParticipantType,
} from "@/typings";
import { nFormatter } from "@/utils/number.utils";
import { calculateCommodityPurchaseTotalPrice } from "@/utils/price.utils";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface ConfirmOrderForConsumerProps {
	onClose(): void;
	onSuccess(): void;
	quantity: number;
	overheadPercentage?: number;
	activeTradeRoutePartner: ParticipantQuantity;
	priceDetails: CommodityPurchasePrice;
	isConsumer: boolean;
}

export function ConfirmOrderForConsumer({
	quantity,
	overheadPercentage,
	onClose,
	onSuccess,
	activeTradeRoutePartner,
	priceDetails,
	isConsumer,
}: ConfirmOrderForConsumerProps) {
	const router = useRouter();
	const { commodity, currentPrice } = useTokenPage();
	const { writeToContract, isSubmitting, isSuccessFullPurchase } = usePublishTx(
		{
			address: contracts.commodityExchange.address,
			abi: contracts.commodityExchange.abi,
			functionName: isConsumer
				? "consumerBuyFromDistributor"
				: "distributorManualBuy",
			eventName: isConsumer
				? "ConsumerPurchaseMade"
				: "DistributorPurchaseMade",
		},
	);

	useEffect(() => {
		if (isSuccessFullPurchase) {
			toast.success("Commodity purchased successfully");
			router.refresh();
			onSuccess();
		}
	}, [isSuccessFullPurchase]);

	async function handlePurchase() {
		const args = isConsumer
			? [
					commodity?.tokenAddress,
					activeTradeRoutePartner?.partner?.id,
					quantity,
				]
			: [commodity?.tokenAddress, activeTradeRoutePartner?.listingIds?.[0]];
		try {
			writeToContract(args, priceDetails?.totalPrice?.toString());
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	}

	return (
		<Modal open onClose={onClose}>
			<div className="p-4 text-sm">
				<h2 className="text-xl font-bold mb-4">Confirm your trade</h2>
				<div
					style={{ borderBottom: "1px solid #efefef" }}
					className="mb-2 pb-4"
				>
					<div className="flex justify-between">
						<span>{commodity?.name}</span>
						<span>{priceDetails?.basePrice} HBAR</span>
					</div>
					<div className="text-sm text-gray-500">
						{quantity} x {currentPrice} HBAR
					</div>
				</div>
				{isConsumer && overheadPercentage && (
					<div className="flex justify-between mb-2">
						<span>Overhead Fee ({overheadPercentage / 100}%)</span>
						<span>{nFormatter(priceDetails?.overheadFee)} HBAR</span>
					</div>
				)}
				<div className="flex justify-between mb-2">
					<span>Service Fee (1%)</span>
					<span>~{nFormatter(priceDetails?.serviceFee)} HBAR</span>
				</div>
				<div className="flex justify-between mb-2">
					<span>Buffer (0.15%)</span>
					<span>~{nFormatter(priceDetails?.buffer)} HBAR</span>
				</div>
				<div
					style={{ borderTop: "1px solid #efefef" }}
					className="flex justify-between font-bold mb-6 mt-4 pt-2 !border-t border-gray-100"
				>
					<span>Total</span>
					<span>{priceDetails?.totalPrice} HBAR</span>
				</div>
				<Button
					onClick={handlePurchase}
					loading={isSubmitting}
					variant="secondary"
					fullWidth
				>
					Confirm Purchase
				</Button>
			</div>
		</Modal>
	);
}
