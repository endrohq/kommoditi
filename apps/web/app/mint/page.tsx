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

import { useCommodities } from "@/hooks/useCommodities";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { ROUTE_HOME } from "@/utils/route.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const commodityExchange = contracts.commodityExchange;

type CommodityListing = {
	tokenAddress?: string;
	quantity?: number;
	price?: number;
	deliveryWindow?: number;
};

export default function Page() {
	const router = useRouter();
	const { commodities } = useCommodities();
	const [listing, setListing] = useState<Partial<CommodityListing>>({});

	const {
		writeToContract: listCommodity,
		isSubmitting,
		isSuccess,
		error,
	} = usePublishTx({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "listCommodity",
		eventName: "CommodityListed",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Commodity listed successfully");
			router.push(ROUTE_HOME);
		}
	}, [isSuccess]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to list commodity");
		}
	}, [error]);

	function handleSubmit() {
		try {
			listCommodity([
				listing.tokenAddress,
				listing.quantity,
				listing.price,
				listing.deliveryWindow,
			]);
		} catch (e) {
			console.error(e);
		}
	}

	const selectedItem = commodities.find(
		(item) => item.tokenAddress === listing?.tokenAddress,
	)?.symbol;

	const symbols = commodities
		?.filter((item) => item.isTradable)
		?.map((item) => item.symbol);

	return (
		<Content>
			<Grid>
				<Column xs={12} sm={10} md={8} lg={8} span={4}>
					<Form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<Dropdown
							id="default"
							titleText="Commodity"
							onChange={(item) =>
								setListing((prev) => ({
									...prev,
									tokenAddress: commodities.find(
										(c) => c.symbol === item?.selectedItem,
									)?.tokenAddress,
								}))
							}
							selectedItem={selectedItem}
							label="Select a commodity"
							items={symbols}
						/>
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
						<TextInput
							id="price"
							labelText="Price"
							type="number"
							value={listing.price}
							onChange={(e) =>
								setListing((prev) => ({
									...prev,
									price: Number(e.target.value),
								}))
							}
							required
						/>
						<DatePicker
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
						</DatePicker>

						<Button
							loading={isSubmitting}
							disabled={
								isSubmitting ||
								!listing.tokenAddress ||
								!listing.quantity ||
								!listing.price ||
								!listing.deliveryWindow
							}
							type="submit"
						>
							List
						</Button>
					</Form>
				</Column>
			</Grid>
		</Content>
	);
}
