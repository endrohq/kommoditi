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
					<TableContainer>
						{/*Add a table of our selected regions*/}
						<Table className="!z-0">
							<TableBody className="!z-0">
								{hasSelectedRegions ? (
									locations?.map((region) => (
										<TableRow className="!z-0" key={`region-${region.id}`}>
											<TableCell className="capitalize">{region.id}</TableCell>
											<TableCell className="font-medium !text-black">
												{region.name} (Lat:{region.centerLat}, Lng:
												{region.centerLng})
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
