"use client";

import { CloseOutlined } from "@/components/icons/CloseOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { SearchAddress } from "@/components/input/SearchAddress";
import { ParticipantType, PlaceType, Region } from "@/typings";

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from "@carbon/react";

import { Button } from "@/components/button";
import { ContextHeader } from "@/components/onboarding/ContextHeader";
import { TrashCan } from "@carbon/icons-react";
import clsx from "clsx";
import React from "react";

interface SelectLocationsProps {
	type: ParticipantType;
	persistLocations(regions: Region[]): void;
	locations: Region[];
}

export function SelectLocations({
	type,
	persistLocations,
}: SelectLocationsProps) {
	const [locations, setLocations] = React.useState<Region[]>();

	const handleRegionSelect = (newRegion: Region) => {
		let regions = locations || [];
		const exists = regions?.some((region) => region.id === newRegion.id);
		if (exists) {
			regions = regions?.filter((region) => region.id !== newRegion.id);
		} else {
			regions = [...regions, newRegion];
		}

		setLocations(regions);
	};

	function handleRegionRemove(region: Region) {
		setLocations(locations?.filter((r) => r.id !== region.id));
	}

	const hasSelectedRegions = locations && locations?.length > 0;

	return (
		<>
			<MapToDisplay mapHeight={200} regions={locations || []} />
			<div className="p-12 gap-4">
				<ContextHeader
					stepIndex={4}
					title="Define where your operating"
					description={
						type === ParticipantType.DISTRIBUTOR ? (
							<>
								As a <span className="font-semibold text-black">{type}</span>{" "}
								you will define the{" "}
								<span className="font-semibold text-black">countries</span> that
								your operating in. This will help us to match you with the right
								partners`
							</>
						) : (
							`As a ${type} you will define the address of your operations. This will help us to match you with the right partners`
						)
					}
				/>
				<div className="">
					<SearchAddress
						onRegionSelect={handleRegionSelect}
						allowTypes={
							type === ParticipantType.DISTRIBUTOR
								? [PlaceType.COUNTRY]
								: [PlaceType.ADDRESS]
						}
					/>

					<div className="!mt-6">
						<div>
							<div className="flex items-center text-xs text-gray-600 font-medium pb-2.5 px-4">
								<div className="w-1/12 ">#</div>
								<div className="w-7/12 ">Location</div>
								<div className="w-4/12"></div>
							</div>
						</div>
						<div className="text-sm">
							{hasSelectedRegions ? (
								locations?.map((region, idx) => (
									<div
										className={clsx("flex items-center py-4 px-4", {
											"bg-gray-50": idx % 2 === 0,
										})}
										key={`region-${region.id}`}
									>
										<div className="capitalize text-xs w-1/12">{idx + 1}</div>
										<div className="w-7/12 font-medium !text-black">
											{region.name}
										</div>
										<div className="w-4/12">
											<div
												onClick={() => handleRegionRemove(region)}
												className="flex items-center hover:text-red-800 cursor-pointer text-gray-600 space-x-1.5"
											>
												<TrashCan className=" " />
												<div>Remove</div>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="py-2 px-4 bg-gray-50 rounded flex items-center">
									<div className="capitalize w-1/12">-</div>
									<div className="w-7/12 text-gray-500">
										No locations selected..
									</div>
								</div>
							)}
						</div>
					</div>
					<Button
						disabled={!locations || locations?.length === 0}
						type="submit"
						variant="black"
						fullWidth
						onClick={() => persistLocations(locations || [])}
						className="mt-6"
					>
						Finish
					</Button>
				</div>
			</div>
		</>
	);
}
