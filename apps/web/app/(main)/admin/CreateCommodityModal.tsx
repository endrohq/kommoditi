"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { Content, Form, TextInput } from "@carbon/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const tokenAuthority = contracts.tokenAuthority;

interface CreateCommodityModalProps {
	onSuccess(): void;
	onCancel(): void;
}

interface CommodityInput {
	name?: string;
	symbol?: string;
}

export function CreateCommodityModal({
	onSuccess,
	onCancel,
}: CreateCommodityModalProps) {
	const [commodity, setCommodity] = useState<CommodityInput>({});
	const {
		writeToContract: registerCommodity,
		isSubmitting,
		isSuccessFullPurchase,
	} = usePublishTx({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "createCommodity",
		eventName: "CommodityCreated",
	});

	useEffect(() => {
		if (isSuccessFullPurchase) {
			toast.success("Commodity created successfully");
			setCommodity({});
			onSuccess();
		}
	}, [isSuccessFullPurchase]);

	function handleCancel() {
		setCommodity({});
		onCancel();
	}

	function handleSubmit() {
		try {
			registerCommodity([commodity.name, commodity.symbol]);
		} catch (e) {
			console.error(e);
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
				<h2 className="text-xl font-bold">Create Commodity</h2>
				<TextInput
					id="commodity-name"
					labelText="Name"
					value={commodity.name}
					onChange={(e) => setCommodity({ ...commodity, name: e.target.value })}
					required
				/>
				<TextInput
					id="commodity-symbol"
					labelText="Symbol"
					value={commodity.symbol}
					onChange={(e) =>
						setCommodity({ ...commodity, symbol: e.target.value })
					}
					required
				/>
				<div className="flex justify-end">
					<Button
						loading={isSubmitting}
						disabled={!commodity?.symbol || !commodity?.symbol || isSubmitting}
						type="submit"
					>
						Create
					</Button>
				</div>
			</Form>
		</Modal>
	);
}
