import { TxStepItem } from "@/app/tokens/[address]/components/widget/TxStep";
import { Button } from "@/components/button";
import { NumericInput } from "@/components/input/NumericInput";
import { usePublishTx } from "@/hooks/usePublishTx";
import { baseCommodityUnit, contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { fetchWrapper } from "@/utils/fetch.utils";
import { Form, TextInput } from "@carbon/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CommodityListing = {
	tokenAddress?: string;
	quantity?: number;
};

type Step = "FORM" | "ASSOCIATION" | "MINTING" | "LISTING";

export default function ListCommodities() {
	const [isMinting, setIsMinting] = useState(false);
	const [isMintingSuccess, setIsMintingSuccess] = useState(false);
	const [step, setStep] = useState<Step>("FORM");
	const [listing, setListing] = useState<Partial<CommodityListing>>({});
	const { commodity } = useTokenPage();
	const { account } = useAuth();

	// Association step
	const {
		writeToContract: associateToken,
		status: associationStatus,
		error: associationError,
		isSuccess: isAssociationSuccess,
		isSubmitting: isAssociating,
		isConfirming: isAssociationConfirming,
	} = usePublishTx({
		address: commodity?.tokenAddress,
		abi: [
			{
				inputs: [],
				name: "associate",
				outputs: [],
				stateMutability: "nonpayable",
				type: "function",
			},
		],
		functionName: "associate",
	});

	// Minting and listing step
	const {
		writeToContract: listCommodity,
		status: listingStatus,
		error: listingError,
		isSuccess: isListingSuccess,
		isSubmitting: isListing,
		isConfirming: isListingConfirming,
	} = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "listCommodity",
		eventName: "CommodityListed",
		contractName: "commodityExchange",
		confirmations: 15,
	});

	useEffect(() => {
		if (isAssociationSuccess) {
			toast.success("Token associated successfully");
			setStep("MINTING");
			handleMintAndList();
		}
	}, [isAssociationSuccess]);

	useEffect(() => {
		if (isListingSuccess) {
			toast.success("Commodity listed successfully");
			setStep("FORM");
			setListing({});
		}
	}, [isListingSuccess]);

	useEffect(() => {
		if (associationError) {
			toast.error(`Association failed: ${associationError.message}`);
			setStep("FORM");
		}
		if (listingError) {
			toast.error(`Listing failed: ${listingError.message}`);
			setStep("FORM");
		}
	}, [associationError, listingError]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStep("ASSOCIATION");
		associateToken([]);
	}

	async function handleMintAndList() {
		try {
			console.log(account?.address);
			setIsMinting(true);
			const { serialNumbers } = await fetchWrapper<{
				serialNumbers: number[];
			}>(`/api/tokens/${commodity.tokenAddress}/mint`, {
				method: "POST",
				body: JSON.stringify({
					quantity: listing.quantity,
					tokenAddress: commodity.tokenAddress,
					receiver: account?.address,
				}),
			});

			if (serialNumbers?.length > 0) {
				setIsMintingSuccess(true);
				setStep("LISTING");
				listCommodity([commodity.tokenAddress, serialNumbers]);
			} else {
				throw new Error("No serial numbers returned from minting");
			}
		} catch (e) {
			console.error(e);
			toast.error("Failed to mint tokens");
			setStep("FORM");
		} finally {
			setIsMinting(false);
		}
	}

	function renderStepContent() {
		if (step === "FORM") {
			return (
				<Form className="space-y-4" onSubmit={handleSubmit}>
					<div className="pb-4">
						<div className="text-xs mb-2 text-gray-800">Amount</div>
						<div className="flex items-center justify-between bg-gray-200 py-2 px-4 rounded">
							<NumericInput
								required
								placeholder="0"
								className="text-lg font-medium"
								value={listing?.quantity}
								onChange={(quantity) =>
									setListing((prev) => ({
										...prev,
										quantity,
									}))
								}
							/>
							<div className="text-gray-400 font-medium flex items-center space-x-1 text-sm">
								<span>{baseCommodityUnit}</span>{" "}
								<span>{commodity?.symbol}</span>
							</div>
						</div>
					</div>
					<Button
						fullWidth
						variant="black"
						disabled={!listing.quantity}
						type="submit"
					>
						List
					</Button>
				</Form>
			);
		}

		return (
			<>
				<TxStepItem
					label={`Associate ${commodity?.name}`}
					isLoading={isAssociating || isAssociationConfirming}
					isSuccess={isAssociationSuccess}
					isNotActiveYet={false}
					index={1}
					hasError={!!associationError}
					description={
						isAssociating
							? "Waiting for confirmation"
							: isAssociationConfirming
								? "Confirming"
								: "Associated"
					}
				/>
				<TxStepItem
					label={`Minting ${commodity?.name}`}
					isLoading={isMinting}
					isSuccess={isMintingSuccess}
					isNotActiveYet={step === "ASSOCIATION"}
					index={2}
					description={
						isMinting ? "Minting tokens" : isMintingSuccess ? "Minted" : ""
					}
				/>
				<TxStepItem
					label={`Listing ${commodity?.name} for sale`}
					isLoading={isListing || isListingConfirming}
					isSuccess={isListingSuccess}
					isNotActiveYet={step === "ASSOCIATION" || step === "MINTING"}
					index={3}
					description={
						isListing
							? "Listing commodity"
							: isListingConfirming
								? "Confirming"
								: isListingSuccess
									? "Listed"
									: ""
					}
				/>
			</>
		);
	}

	return (
		<div className="bg-gray-100 rounded p-6 space-y-2">
			<div className="flex justify-between mb-4">
				<h2 className="font-bold text-base">Add Listing</h2>
			</div>
			{renderStepContent()}
		</div>
	);
}
