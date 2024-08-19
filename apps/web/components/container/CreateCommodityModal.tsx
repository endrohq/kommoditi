"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/input/TextInput";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { fetchWrapper } from "@/utils/fetch.utils";
import { parseNumberToSmFormat } from "@/utils/number.utils";
import { getTokenPage } from "@/utils/route.utils";
import { Form } from "@carbon/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CreateCommodityModalProps {
	onClose(): void;
}

interface CommodityInput {
	name?: string;
	symbol?: string;
}

export function CreateCommodityModal({ onClose }: CreateCommodityModalProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [commodity, setCommodity] = useState<CommodityInput>({});
	const [tokenAddress, setTokenAddress] = useState<string | null>(null);
	const {
		writeToContract: registerCommodity,
		isSubmitting,
		isSuccess,
		isConfirming,
	} = usePublishTx({
		address: contracts?.commodityExchange.address,
		abi: contracts?.commodityExchange.abi,
		functionName: "createCommodityToken",
		eventName: "CommodityTokenCreated",
		contractName: "tokenAuthority",
		confirmations: 5,
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Commodity token created successfully");
			if (tokenAddress) {
				router.push(getTokenPage(`0x${tokenAddress}`));
			}
			onClose();
		}
	}, [isSuccess]);

	function handleCancel() {
		setCommodity({});
		onClose();
	}

	async function handleSubmit() {
		try {
			setIsLoading(true);
			const { tokenAddress, tokenId } = await fetchWrapper<{
				tokenAddress: string;
				tokenId: string;
			}>("/api/tokens", {
				method: "POST",
				body: JSON.stringify({
					name: commodity.name,
					symbol: commodity.symbol,
				}),
			});
			setTokenAddress(tokenAddress);
			registerCommodity([`0x${tokenAddress}`]);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Modal open onClose={handleCancel}>
			<Form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<h2 className="text-xl text-black font-bold">Create Commodity</h2>
				<div>
					<div className="text-xs mb-1 text-gray-800">Name</div>
					<div className="flex items-center justify-between bg-gray-100 py-2 px-4 rounded">
						<TextInput
							value={commodity.name}
							onChange={(name) => setCommodity({ ...commodity, name })}
							required
							placeholder="Basmati Rice, Crude Oil, etc."
							className="text-sm text-black"
						/>
					</div>
				</div>
				<div>
					<div className="text-xs mb-1 text-gray-800">Symbol</div>
					<div className="flex items-center justify-between bg-gray-100 py-2 px-4 rounded">
						<TextInput
							placeholder="BASRICE, CRUDEOIL, etc."
							value={commodity.symbol}
							onChange={(symbol) => setCommodity({ ...commodity, symbol })}
							required
							className="text-sm text-black"
						/>
					</div>
				</div>
				<div className="flex justify-end">
					<Button
						variant="black"
						loading={isSubmitting || isConfirming || isLoading}
						disabled={!commodity?.symbol || !commodity?.symbol}
						type="submit"
						size="sm"
					>
						Create
					</Button>
				</div>
			</Form>
		</Modal>
	);
}
