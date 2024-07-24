"use client";

import { Button } from "@/components/button";
import { Column, Content, Form, Grid, TextInput } from "@carbon/react";

import { SearchAddress } from "@/components/input/SearchAddress";
import { useWriteTransaction } from "@/hooks/useWriteTransaction";
import { contracts } from "@/lib/constants";
import { LocationItem } from "@/typings";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const producerRegistry = contracts.producerRegistry;

export default function Page() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [location, setLocation] = useState<LocationItem>();

	const {
		submitTransaction: registerProducer,
		isSubmitting,
		isSuccess,
		error,
	} = useWriteTransaction({
		address: producerRegistry.address,
		abi: producerRegistry.abi,
		functionName: "registerProducer",
		eventName: "ProducerRegistered",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Successfully registered as producer");
			router.push(`/`);
		}
	}, [isSuccess]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to register producer. Try again later.");
		}
	}, [error]);

	function handleSubmit() {
		try {
			registerProducer([name, location?.address, location?.h3Index]);
		} catch (e) {
			console.error(e);
		}
	}

	// 10207 Lakewood Blvd., Downey, California, United States

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
						<TextInput
							id="producer-name"
							labelText="Producer Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
						<SearchAddress setLocation={setLocation} />
						<div className="border p-4 bg-gray-50 border-gray-100 rounded">
							<div className="text-sm font-semibold">Selected Address</div>
							<>
								{!location ? (
									<div className="text-gray-500">-</div>
								) : (
									<>
										<div className="text-sm text-gray-700">
											{location?.address}
										</div>
										<div className="text-sm text-gray-700">
											{location?.lat}, {location?.lng}
										</div>
										<div className="text-sm text-gray-700">
											{location?.h3Index}
										</div>
									</>
								)}
							</>
						</div>
						<Button
							loading={isSubmitting}
							disabled={!name || !location?.h3Index || isSubmitting}
							type="submit"
						>
							Register Producer
						</Button>
					</Form>
				</Column>
			</Grid>
		</Content>
	);
}
