"use client";

import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { Modal } from "@/components/modal";
import { AddBasicInfo } from "@/components/onboarding/AddBasicInfo";
import { SelectLocations } from "@/components/onboarding/SelectLocations";
import { SelectType } from "@/components/onboarding/SelectType";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { ParticipantType, Region } from "@/typings";
import { participantTypeToSmParticipantType } from "@/utils/parser.utils";

import { CheckOutlined } from "@/components/icons/CheckOutlined";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/providers/AuthProvider";
import { normalizeCoordinate } from "@/utils/number.utils";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ParticipantArgs {
	name: string;
	overheadPercentage: number;
	locations: Region[];
}

interface RegisterParticipantProfileProps {
	refetch(): void;
}

export function OnboardingModal({ refetch }: RegisterParticipantProfileProps) {
	const { logout, account } = useAuth();
	const [type, setType] = useState<ParticipantType>();
	const [participant, setParticipant] = useState<Partial<ParticipantArgs>>({});

	const {
		writeToContract: register,
		isSubmitting,
		isSuccess,
		isConfirming,
		error,
	} = usePublishTx({
		address: contracts.participantRegistry.address,
		abi: contracts.participantRegistry.abi,
		functionName: "registerParticipant",
		eventName: "ParticipantRegistered",
		contractName: "participantRegistry",
	});

	useEffect(() => {
		if (participant?.locations && participant?.locations?.length > 0) {
			handleSubmit();
		}
	}, [participant]);

	useEffect(() => {
		if (isSuccess) {
			refetch();
		}
	}, [isSuccess]);

	useEffect(() => {
		if (error) {
			toast.error("Failed to register. Try again later.");
		}
	}, [error]);

	function handleSubmit() {
		if (!type) return;

		const contractType = participantTypeToSmParticipantType(type);
		try {
			// Normalise the locations to a smart contract compatible format
			const locations = participant?.locations?.map((region) => ({
				id: region.id,
				name: region.name,
				locationType: region.locationType,
				centerLng: normalizeCoordinate(region.centerLng),
				centerLat: normalizeCoordinate(region.centerLat),
			}));
			register([participant?.name, 25, contractType, locations]);
		} catch (e) {
			console.error(e);
		}
	}

	const canSubmit = type && participant.name && participant.locations;

	return (
		<Modal
			wrapperWidth={!type ? "max-w-4xl" : !canSubmit ? "max-w-4xl" : "max-w-lg"}
			open
			onClose={() => ""}
			withPadding={false}
			showClose={false}
		>
			{!isSubmitting && !isConfirming && !isSuccess && (
				<div className="flex justify-between px-4 mt-4">
					<div className="text-xs text-red-700">
						* This app relies on having HBAR in your wallet to pay for
						transactions.
					</div>
					<div
						className="text-sm cursor-pointer text-blue-700"
						onClick={logout}
					>
						Logout
					</div>
				</div>
			)}
			{!type ? (
				<SelectType setType={setType} />
			) : !participant.name ? (
				<AddBasicInfo
					persistName={(name) => setParticipant((prev) => ({ ...prev, name }))}
				/>
			) : !participant?.locations ? (
				<SelectLocations
					type={type}
					locations={participant.locations || []}
					persistLocations={(regions) =>
						setParticipant((prev) => ({ ...prev, locations: regions }))
					}
				/>
			) : (
				<div className="p-12 flex flex-col items-center">
					<div
						className={clsx(
							"w-32 aspect-square  mb-10 rounded-full flex flex-col items-center justify-center",
							{
								"animate-pulse bg-gray-50": isSubmitting || isConfirming,
								"bg-green-50": isSuccess,
							},
						)}
					>
						{isSubmitting || isConfirming ? (
							<LoadingOutlined className="text-gray-400" />
						) : (
							<CheckOutlined className="text-green-500" />
						)}
					</div>
					<div className="font-bold text-xl text-center">Almost there</div>
					<p className="text-sm text-gray-600 text-center w-10/12 mx-auto">
						We're registering your profile. This may take a few seconds. Please
						do not close this window. Go ahead and refresh if you see the
						completed screen for more than 1min.
					</p>
				</div>
			)}
		</Modal>
	);
}
