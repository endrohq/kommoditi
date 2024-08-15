import { appTitle } from "@/lib/constants";
import { ParticipantType } from "@/typings";
import React from "react";

const participants = [
	{
		name: "Producer",
		description:
			"You'll explore functionalities through a mobile experience. You can create commodities, list them, and track their journey.",
		type: ParticipantType.PRODUCER,
	},
	{
		name: "Logistics",
		description:
			"Take a more holistic view of the supply chain. Where your main responsibility is to move commodities from one location to another.",
		type: ParticipantType.CTF,
	},
	{
		name: "Consumer",
		description:
			"Your task is simple. Make use of our advanced algorithms helping you receive the best commodities to your doorstep.",
		type: ParticipantType.CONSUMER,
	},
];

interface SelectTypeProps {
	setType(type: ParticipantType): void;
}

export function SelectType({ setType }: SelectTypeProps) {
	return (
		<div className="p-10">
			<div className=" ">
				<h2 className="font-bold text-2xl mb-1">Welcome to {appTitle} 👋</h2>
				<p className="text-sm text-gray-800 leading-relaxed w-8/12">
					Our platform has three main roles: Producers, Logistics, and
					Consumers. Each role has a unique set of features and capabilities.
					Please select the role that best describes you.
				</p>
				<div className="mt-10 mb-4">
					<div className="font-medium text-gray-500 text-xs">STEP 1</div>
					<div className=" font-bold">Select your role</div>
				</div>
			</div>
			<div className="grid grid-cols-3  gap-4 pt-0">
				{
					// This is a list of participants
					participants.map((participant) => (
						<div
							onClick={() => setType(participant.type)}
							className="w-full py-8 px-4 rounded flex flex-col justify-between bg-indigo-50 cursor-pointer hover:bg-indigo-100 transition-all group"
						>
							<div className=" ">
								<div className="capitalize group-hover:text-blue-700 text-base font-bold text-black">
									{participant.name}
								</div>
								<p className="text-gray-950 leading-relaxed text-sm">
									{participant.description}
								</p>
							</div>
						</div>
					))
				}
			</div>
		</div>
	);
}
