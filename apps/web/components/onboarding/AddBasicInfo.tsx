"use client";

import { Button } from "@/components/button";
import { CloseOutlined } from "@/components/icons/CloseOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { SearchAddress } from "@/components/input/SearchAddress";
import { Modal } from "@/components/modal";
import { ContextHeader } from "@/components/onboarding/ContextHeader";
import { SelectLocations } from "@/components/onboarding/SelectLocations";
import { SelectType } from "@/components/onboarding/SelectType";
import { usePublishTx } from "@/hooks/usePublishTx";
import { appTitle, contracts } from "@/lib/constants";
import { ParticipantType, Region } from "@/typings";
import { participantTypeToSmParticipantType } from "@/utils/parser.utils";
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

interface AddBasicInfoProps {
	persistName(name: string): void;
}

export function AddBasicInfo({ persistName }: AddBasicInfoProps) {
	const [name, setName] = useState<string>("");

	return (
		<div className="p-12">
			<ContextHeader
				stepIndex={2}
				title="Basics"
				description="Let's start with the basics and add some basic information about your
					company"
			/>
			<div className="">
				<TextInput
					id="producer-name"
					labelText="Company Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>

				<Button
					disabled={!name}
					type="submit"
					variant="black"
					fullWidth
					onClick={() => persistName(name)}
					className="mt-6"
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
