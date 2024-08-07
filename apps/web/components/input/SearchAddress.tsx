import { LocationItem, Region } from "@/typings";
import { ContainedList, ContainedListItem, Search } from "@carbon/react";
import { latLngToCell, polygonToCells } from "h3-js";
import debounce from "lodash.debounce";
import React, { useState, useCallback } from "react";

interface SearchAddressProps {
	onRegionSelect: (region: Region) => void;
	placeholder?: string;
}

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function SearchAddress({
	onRegionSelect,
	placeholder = "Search for an address",
}: SearchAddressProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);

	const handleAddressSearch = useCallback(async (query: string) => {
		if (!query) {
			setSearchResults([]);
			return;
		}

		const response = await fetch(
			`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
				query,
			)}.json?access_token=${mapboxAccessToken}`,
		);
		const data = await response.json();

		if (data.features && data.features.length > 0) {
			setSearchResults(data.features);
		} else {
			setSearchResults([]);
		}
	}, []);

	const handleResultSelect = useCallback(
		(result: any) => {
			let h3Indexes: string[];
			let bbox: [number, number, number, number];

			if (result.bbox) {
				bbox = result.bbox;
				const resolution = getAppropriateResolution(bbox, result.place_type);
				h3Indexes = polyfill(bbox, resolution);
			} else {
				// For point results (like specific addresses)
				const [lng, lat] = result.center;
				const resolution = 9; // Higher resolution for specific addresses
				h3Indexes = [latLngToCell(lat, lng, resolution)];

				// Create a small bounding box around the point
				const offset = 0.0005;
				bbox = [lng - offset, lat - offset, lng + offset, lat + offset];
			}

			const newRegion: Region = {
				id: result.id,
				name: result.place_name,
				h3Indexes: h3Indexes,
			};

			onRegionSelect(newRegion);

			setSearchResults([]);
			setQuery(result.place_name);
		},
		[onRegionSelect],
	);

	const debouncedHandleAddressSearch = debounce(handleAddressSearch, 300);

	return (
		<ContainedList label="Search Address" kind="on-page" action={""}>
			<Search
				labelText="Location"
				placeholder={placeholder}
				onChange={(e) => {
					setQuery(e.target.value);
					debouncedHandleAddressSearch(e.target.value);
				}}
				value={query}
			/>
			{searchResults.map((result, key) => (
				<ContainedListItem
					key={key}
					onClick={() => handleResultSelect(result)}
					className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
				>
					{result.place_name}
				</ContainedListItem>
			))}
		</ContainedList>
	);
}

// Helper functions
function getAppropriateResolution(
	bbox: [number, number, number, number],
	placeType: string[],
): number {
	const [minLon, minLat, maxLon, maxLat] = bbox;
	const diagonalDistance = getDistanceFromLatLonInKm(
		minLat,
		minLon,
		maxLat,
		maxLon,
	);

	// Adjust resolution based on place type and size
	if (placeType.includes("country")) {
		if (diagonalDistance > 2000) return 2;
		if (diagonalDistance > 1000) return 3;
		return 4;
	}

	if (
		placeType.includes("region") ||
		placeType.includes("state") ||
		placeType.includes("city") ||
		placeType.includes("place")
	) {
		if (diagonalDistance > 500) return 4;
		if (diagonalDistance > 200) return 5;
		return 6;
	}

	if (placeType.includes("city") || placeType.includes("place")) {
		if (diagonalDistance > 50) return 6;
		if (diagonalDistance > 20) return 7;
		return 8;
	}

	// For smaller areas, including addresses
	if (diagonalDistance > 1) return 9;
	if (diagonalDistance > 0.5) return 10;
	return 11; // Highest resolution for very small areas or specific addresses
}

function getDistanceFromLatLonInKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) {
	const R = 6371;
	const dLat = deg2rad(lat2 - lat1);
	const dLon = deg2rad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

function deg2rad(deg: number) {
	return deg * (Math.PI / 180);
}

function polyfill(
	bbox: [number, number, number, number],
	resolution: number,
): string[] {
	const [minLon, minLat, maxLon, maxLat] = bbox;
	const h3Indexes = new Set<string>();

	for (let lat = minLat; lat <= maxLat; lat += 0.01) {
		for (let lon = minLon; lon <= maxLon; lon += 0.01) {
			h3Indexes.add(latLngToCell(lat, lon, resolution));
		}
	}

	return Array.from(h3Indexes);
}
