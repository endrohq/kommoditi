"use client";

import { ArrowLeftOutlined } from "@/components/icons/ArrowLeftOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { ParticipantUserView } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { findTradingPartners } from "@/utils/overlap.utils";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@carbon/react";
import React from "react";

interface UserLayoutPageProps {
	participants: ParticipantUserView[];
}

export function UserLayout({ participants }: UserLayoutPageProps) {
	const [activeParticipant, setActiveParticipant] =
		React.useState<ParticipantUserView>();

	let participantsToShow = participants;
	if (activeParticipant) {
		const partners = findTradingPartners(participants, activeParticipant);
		console.log({ partners });
		participantsToShow = participants?.filter((p) => partners.includes(p.id));
	}

	return (
		<div className="flex items-start h-full">
			<div className="w-1/2 rounded overflow-hidden">
				<MapToDisplay
					regions={participantsToShow?.flatMap((p) => p.locations) || []}
				/>
			</div>
			<div className="w-1/2 px-20 my-8 sm:my-14">
				<div className="flex flex-col mb-14 space-y-10">
					<div
						onClick={() => setActiveParticipant(undefined)}
						className="flex items-center space-x-2"
					>
						<ArrowLeftOutlined className="text-black text-sm" />
						<div className="text-black text-xs font-medium">
							Back to overview
						</div>
					</div>
					<div className="">
						<h2 className="font-bold">
							{activeParticipant?.name ||
								"Select a participant to view their trading partners"}
						</h2>
						<div className="text-[11px] text-gray-500 font-medium">
							{activeParticipant?.locations
								?.map((item) => item.name)
								?.join("  <->  ")}
						</div>
					</div>
				</div>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Participant</TableCell>
								{participantsToShow?.length > 0 && (
									<>
										<TableHeader>Addresses</TableHeader>
										<TableHeader>Joined At</TableHeader>
									</>
								)}
							</TableRow>
						</TableHead>
						<TableBody>
							{participantsToShow && participantsToShow?.length > 0 ? (
								participantsToShow?.map((participant) => (
									<TableRow onClick={() => setActiveParticipant(participant)}>
										<TableCell>{participant.name}</TableCell>
										<TableCell>
											{participant?.locations
												?.map((item) => item.name)
												?.join("  <->  ")}
										</TableCell>
										<TableCell>
											{getDistanceForDate(new Date(participant?.createdAt))}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell>No participants found</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</div>
	);
}
