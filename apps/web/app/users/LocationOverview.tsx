"use client";

import { MapToDisplay } from "@/components/input/MapToDisplay";
import { Region } from "@/typings";

interface PageProps {
	regions: Region[];
}

export function LocationOverview({ regions }: PageProps) {
	return (
		<div className="p4 rounded overflow-hidden">
			<MapToDisplay regions={regions} mapHeight={400} />
		</div>
	);
}
