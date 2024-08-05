"use client";

import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { Form, TextInput } from "@carbon/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CommodityListing = {
	tokenAddress?: string;
	quantity?: number;
	deliveryWindow?: number;
};

export default function Page() {
	const { commodity } = useTokenPage();

	const router = useRouter();
	const [listing, setListing] = useState<Partial<CommodityListing>>({});

	const {
		writeToContract: listCommodity,
		isSubmitting,
		isSuccess,
		error,
	} = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "listCommodity",
		eventName: "CommodityListed",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Commodity listed successfully");
			router.push("/producers");
		}
	}, [isSuccess]);

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
		<div className="">
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
		</div>
	);
}
