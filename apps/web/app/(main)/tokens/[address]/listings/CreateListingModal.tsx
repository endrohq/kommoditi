"use client";

import { Button } from "@/components/button";
import {
	Column,
	Content,
	DatePicker,
	DatePickerInput,
	Dropdown,
	Form,
	Grid,
	TextInput,
} from "@carbon/react";

import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useCommodities } from "@/providers/CommoditiesProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { ROUTE_HOME } from "@/utils/route.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const commodityExchange = contracts.commodityExchange;

type CommodityListing = {
	tokenAddress?: string;
	quantity?: number;
	deliveryWindow?: number;
};

interface CreateListingModalProps {
	handleClose(): void;
}

export default function CreateListingModal({
	handleClose,
}: CreateListingModalProps) {
	const { commodity } = useTokenPage();

	const [listing, setListing] = useState<Partial<CommodityListing>>({});

	const {
		writeToContract: listCommodity,
		isSubmitting,
		isSuccessFullPurchase,
		error,
	} = usePublishTx({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "listCommodity",
		eventName: "CommodityListed",
	});

	useEffect(() => {
		if (isSuccessFullPurchase) {
			toast.success("Commodity listed successfully");
			handleClose();
		}
	}, [isSuccessFullPurchase]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to list commodity");
		}
	}, [error]);

	function handleSubmit() {
		try {
			listCommodity([commodity.tokenAddress, listing.quantity]);
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<Modal open onClose={handleClose}>
			<div className="flex justify-between mb-4">
				<h2 className="font-bold text-base">Add Listing</h2>
			</div>
			<Form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<TextInput
					id="quantity"
					labelText="Quantity"
					type="number"
					value={listing.quantity}
					onChange={(e) =>
						setListing((prev) => ({
							...prev,
							quantity: Number(e.target.value),
						}))
					}
					required
				/>
				{/*<DatePicker
							onChange={([date]) =>
								setListing((prev) => ({
									...prev,
									deliveryWindow: date?.getTime(),
								}))
							}
							value={listing.deliveryWindow}
							datePickerType="single"
						>
							<DatePickerInput
								placeholder="mm/dd/yyyy"
								labelText="Date Picker label"
								id="date-picker-simple"
							/>
						</DatePicker>*/}

				<Button
					fullWidth
					variant="black"
					loading={isSubmitting}
					disabled={isSubmitting || !listing.quantity}
					type="submit"
				>
					List
				</Button>
			</Form>
		</Modal>
	);
}
