"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { useWriteTransaction } from "@/hooks/useWriteTransaction";
import { contracts } from "@/lib/constants";
import { Commodity } from "@/typings";
import { Content, Form, TextInput } from "@carbon/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useReadContract, useWriteContract } from "wagmi";

const tokenAuthority = contracts.tokenAuthority;

interface CreateCommodityModalProps {
	onSuccess(): void;
	onCancel(): void;
}

export function CreateCommodityModal({
	onSuccess,
	onCancel,
}: CreateCommodityModalProps) {
	const [commodity, setCommodity] = useState<Partial<Commodity>>({});
	const {
		submitTransaction: registerCommodity,
		isSubmitting,
		isSuccess,
	} = useWriteTransaction({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "createCommodity",
		eventName: "CommodityCreated",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Commodity created successfully");
			setCommodity({});
			onSuccess();
		}
	}, [isSuccess]);

	function handleCancel() {
		setCommodity({});
		onCancel();
	}

	function handleSubmit() {
		try {
			registerCommodity([commodity.type, commodity.name, commodity.symbol]);
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<Modal open close={handleCancel}>
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
				<TextInput
					id="commodity-type"
					labelText="Type"
					value={commodity.type}
					onChange={(e) => setCommodity({ ...commodity, type: e.target.value })}
					required
				/>
				<div className="flex justify-end">
					<Button
						loading={isSubmitting}
						disabled={
							!commodity?.name ||
							!commodity?.symbol ||
							!commodity?.type ||
							isSubmitting
						}
						type="submit"
					>
						Create
					</Button>
				</div>
			</Form>
		</Modal>
	);
}
