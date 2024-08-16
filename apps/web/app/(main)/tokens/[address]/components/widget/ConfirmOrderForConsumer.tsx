"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { CommodityGroup, Participant } from "@/typings";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

interface ConfirmOrderForConsumerProps {
	activeCommodityByRegion?: CommodityGroup;
	onClose(): void;
	quantity: number;
	ctfs: Participant[];
}

export function ConfirmOrderForConsumer({
	quantity,
	activeCommodityByRegion,
	onClose,
	ctfs,
}: ConfirmOrderForConsumerProps) {
	const { commodity, currentPrice } = useTokenPage();
	const { writeToContract, isSubmitting, isSuccess } = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "purchaseCommodityFromCTF",
		eventName: "CommodityPurchased",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Commodity purchased successfully");
			onClose();
		}
	}, []);

	function calculateTotalPrice() {
		if (!currentPrice) return;
		const basePrice = currentPrice * quantity;
		const overheadFee = (basePrice / 100) * 25;
		return basePrice + overheadFee;
	}

	async function handlePurchase() {
		try {
			const activeCtfAddress = ctfs?.[0]?.id;
			const totalPrice = calculateTotalPrice();
			writeToContract(
				[commodity?.tokenAddress, activeCtfAddress, quantity],
				totalPrice?.toString(),
			);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	}

	return (
		<Modal open onClose={onClose}>
			<div>
				<div>
					<div className="text-sm">
						<div>Requesting: {quantity}</div>
						<div>Supply: {activeCommodityByRegion?.quantity}</div>
						<div>country: {activeCommodityByRegion?.country}</div>
					</div>
				</div>
			</div>
			<Button
				onClick={handlePurchase}
				loading={isSubmitting}
				variant="secondary"
				fullWidth
			>
				Confirm
			</Button>
		</Modal>
	);
}
