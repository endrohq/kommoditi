"use client";

import { Button } from "@/components/button";
import { Column, Content, Form, Grid, TextInput } from "@carbon/react";

import { SearchAddress } from "@/components/input/SearchAddress";
import { contracts } from "@/lib/constants";
import { LocationItem } from "@/typings";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWatchContractEvent, useWriteContract } from "wagmi";

const producerRegistry = contracts.producerRegistry;

export default function Page() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [name, setName] = useState("");
	const [location, setLocation] = useState<LocationItem>();

	const {
		writeContract: registerProducer,
		data: hash,
		error,
	} = useWriteContract();

	useWatchContractEvent({
		address: producerRegistry.address,
		abi: producerRegistry.abi,
		eventName: "ProducerRegistered",
		onLogs(logs) {
			logs.forEach((log) => {
				if (log.transactionHash === hash) {
					toast.success("Successfully registered producer");
					setIsRegistering(false);
					// Navigate to producer page
				}
			});
		},
	});

	useEffect(() => {
		if (error) {
			toast.error("Failed to register producer. Try again later.");
			setIsRegistering(false);
		}
	}, [error]);

	function handleSubmit() {
		if (isRegistering) return;
		setIsRegistering(true);

		try {
			registerProducer({
				address: producerRegistry.address,
				abi: producerRegistry.abi,
				functionName: "registerProducer",
				args: [name, location?.text, location?.h3Index],
			});
		} catch (e) {
			console.error(e);
			setIsRegistering(false);
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
											{location?.text}
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
							loading={isRegistering}
							disabled={!name || !location?.h3Index || isRegistering}
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
