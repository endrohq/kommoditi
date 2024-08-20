"use client";

import { TxStepItem } from "@/app/tokens/[address]/components/widget/TxStep";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import {
	ApiResponse,
	CommodityGroup,
	CommodityPurchasePrice,
	Participant,
	ParticipantQuantity,
	ParticipantType,
} from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { nFormatter } from "@/utils/number.utils";
import { calculateCommodityPurchaseTotalPrice } from "@/utils/price.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

type Step = "INITIAL" | "PURCHASING" | "TRANSFERRING";

export function ConfirmOrderForConsumer({
	quantity,
	overheadPercentage,
	onClose,
	onSuccess,
	activeTradeRoutePartner,
	priceDetails,
	isConsumer,
}: ConfirmOrderForConsumerProps) {
	const { account } = useAuth();
	const router = useRouter();
	const { commodity, currentPrice } = useTokenPage();
	const [step, setStep] = useState<Step>("INITIAL");

	const [listingIds, setListingIds] = useState<number[]>([]);
	const [isTransferring, setIsTransferring] = useState(false);
	const [isTransferSuccess, setIsTransferSuccess] = useState(false);
	const [transferError, setTransferError] = useState<Error | null>(null);

	const {
		writeToContract: purchaseCommodity,
		isSubmitting: isPurchasing,
		isConfirming: isPurchaseConfirming,
		isSuccess: isPurchaseSuccess,
		error: purchaseError,
	} = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: isConsumer
			? "consumerBuyFromDistributor"
			: "distributorManualBuy",
		eventName: isConsumer ? "ConsumerPurchaseMade" : "DistributorPurchaseMade",
		contractName: "commodityExchange",
	});

	useEffect(() => {
		if (isPurchaseSuccess && !isConsumer) {
			setStep("TRANSFERRING");
			handleTransfer();
		}
	}, [isPurchaseSuccess]);

	useEffect(() => {
		if (
			(isConsumer && isPurchaseSuccess) ||
			(!isConsumer && isTransferSuccess)
		) {
			toast.success("Commodity purchased successfully");
			router.refresh();
			onSuccess();
		}
	}, [isPurchaseSuccess, isTransferSuccess]);

	async function handlePurchase() {
		setStep("PURCHASING");
		const args = isConsumer
			? [
					commodity?.tokenAddress,
					activeTradeRoutePartner?.partner?.id,
					quantity,
				]
			: [commodity?.tokenAddress, activeTradeRoutePartner?.listingIds?.[0]];
		try {
			purchaseCommodity(args, priceDetails?.totalPrice?.toString());
			if (activeTradeRoutePartner?.listingIds) {
				setListingIds(activeTradeRoutePartner?.listingIds);
			}
		} catch (error) {
			console.error("Purchase transaction failed:", error);
			setStep("INITIAL");
		}
	}

	async function handleTransfer() {
		if (listingIds.length === 0) {
			console.error("No serial numbers available for transfer");
			return;
		}
		setIsTransferring(true);
		try {
			const result = await fetchWrapper<ApiResponse>("/api/tokens/transfer", {
				method: "POST",
				body: JSON.stringify({
					tokenAddress: commodity?.tokenAddress,
					fromAddress: activeTradeRoutePartner?.partner?.id, // Producer's address
					toAddress: account?.address, // Distributor's address
					serialNumbers: listingIds,
				}),
			});

			if (result?.success) {
				setIsTransferSuccess(true);
			} else {
				throw new Error(result.error || "Transfer failed");
			}
		} catch (error) {
			console.error("Transfer failed:", error);
			setTransferError(error as Error);
		} finally {
			setIsTransferring(false);
		}
	}

	function renderStepContent() {
		return (
			<>
				<TxStepItem
					label="Purchase Commodity"
					isLoading={isPurchasing || isPurchaseConfirming}
					isSuccess={isPurchaseSuccess}
					isNotActiveYet={step === "INITIAL"}
					index={1}
					hasError={!!purchaseError}
					description={
						isPurchasing
							? "Confirming purchase"
							: isPurchaseConfirming
								? "Finalizing purchase"
								: "Purchase complete"
					}
				/>
				{!isConsumer && (
					<TxStepItem
						label="Transfer NFTs"
						isLoading={isTransferring}
						isSuccess={isTransferSuccess}
						isNotActiveYet={step === "INITIAL" || step === "PURCHASING"}
						index={2}
						hasError={!!transferError}
						description={
							isTransferring
								? "Transferring NFTs"
								: isTransferSuccess
									? "Transfer complete"
									: transferError
										? "Transfer failed"
										: "Waiting to transfer"
						}
					/>
				)}
			</>
		);
	}

	return (
		<Modal open onClose={onClose}>
			<div className="p-4 text-sm">
				<h2 className="text-xl font-bold mb-4">Confirm your trade</h2>
				{step === "INITIAL" ? (
					<>
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
							loading={isPurchasing || isTransferring}
							variant="secondary"
							fullWidth
						>
							Confirm Purchase
						</Button>
					</>
				) : (
					renderStepContent()
				)}
			</div>
		</Modal>
	);
}
