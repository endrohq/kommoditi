"use client";

import { Button } from "@/components/button";
import { ContextHeader } from "@/components/onboarding/ContextHeader";
import { TextInput } from "@carbon/react";
import React, { useState } from "react";

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
