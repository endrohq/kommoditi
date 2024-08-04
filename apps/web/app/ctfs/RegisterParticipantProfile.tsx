"use client";

import { Button } from "@/components/button";
import { CloseOutlined } from "@/components/icons/CloseOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { SearchAddress } from "@/components/input/SearchAddress";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { ParticipantType, Region } from "@/typings";
import {
	Content,
	Form,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextInput,
} from "@carbon/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ParticipantArgs {
	name: string;
	overheadPercentage: number;
	locations: Region[];
}

enum ParticipantTypeArg {
	Producer,
	CTF,
	Consumer,
}

interface RegisterParticipantProfileProps {
	type: ParticipantType;
}

export function RegisterParticipantProfile({
	type,
}: RegisterParticipantProfileProps) {
	const router = useRouter();
	const [participant, setParticipant] = useState<Partial<ParticipantArgs>>({});

	const {
		writeToContract: register,
		isSubmitting,
		isSuccess,
		error,
	} = usePublishTx({
		address: contracts.participantRegistry.address,
		abi: contracts.participantRegistry.abi,
		functionName: "registerParticipant",
		eventName: "ParticipantRegistered",
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

	function typeToParticipantType(type: ParticipantType) {
		switch (type) {
			case "ctf":
				return ParticipantTypeArg.CTF;
			case "producer":
				return ParticipantTypeArg.Producer;
			case "consumer":
				return ParticipantTypeArg.Consumer;
		}
	}

	function handleSubmit() {
		const contractType = typeToParticipantType(type);
		try {
			console.log(participant?.locations);
			// register([participant?.name, 25, contractType, participant?.locations]);
		} catch (e) {
			console.error(e);
		}
	}

	const handleRegionSelect = (newRegion: Region) => {
		let regions = participant.locations || [];
		const exists = regions?.some((region) => region.id === newRegion.id);
		if (exists) {
			regions = regions?.filter((region) => region.id !== newRegion.id);
		} else {
			regions = [...regions, newRegion];
		}

		setParticipant((prev) => ({
			...prev,
			locations: regions,
		}));
	};

	function handleRegionRemove(region: Region) {
		setParticipant((prev) => ({
			...prev,
			locations: prev.locations?.filter((r) => r.id !== region.id),
		}));
	}

	const hasSelectedRegions =
		participant?.locations && participant?.locations?.length > 0;

	return (
		<div className="grid grid-cols-2">
			<MapToDisplay regions={participant?.locations || []} />
			<Content className="px-20">
				<div className="mb-6">
					<h1 className="font-bold text-2xl mb-1">Create your CTF profile</h1>
					<p className="text-sm text-gray-600 leading-relaxed w-7/12">
						Welcome to the CTF profile creation page! Here you can select
						regions that you are interested in and view them in the table below.
					</p>
				</div>

				<Form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="space-y-10"
				>
					<TextInput
						id="producer-name"
						labelText="Company Name"
						value={participant?.name}
						onChange={(e) =>
							setParticipant((prev) => ({ ...prev, name: e.target.value }))
						}
						required
					/>

					<div className="">
						<h2 className="font-semibold text-lg">Selected Regions</h2>
						<p className="text-sm text-gray-600 mb-4">
							Select the regions you actively operate in
						</p>
						<SearchAddress onRegionSelect={handleRegionSelect} />
						<TableContainer>
							{/*Add a table of our selected regions*/}
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>ID</TableCell>
										{hasSelectedRegions && (
											<>
												<TableCell>Name</TableCell>
												<TableCell></TableCell>
											</>
										)}
									</TableRow>
								</TableHead>
								<TableBody>
									{hasSelectedRegions ? (
										participant?.locations?.map((region) => (
											<TableRow key={`region-${region.id}`}>
												<TableCell className="capitalize">
													{region.id}
												</TableCell>
												<TableCell className="font-medium !text-black">
													{region.name} ({region.h3Indexes?.length})
												</TableCell>
												<TableCell>
													<CloseOutlined
														className="text-gray-600 hover:text-red-800 cursor-pointer"
														onClick={() => handleRegionRemove(region)}
													/>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell>Add the regions you are active in</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</div>

					<Button
						loading={isSubmitting}
						disabled={!participant?.name || !hasSelectedRegions || isSubmitting}
						type="submit"
						variant="black"
						fullWidth
						className="mt-6"
					>
						Register Producer
					</Button>
				</Form>
			</Content>
		</div>
	);
}
