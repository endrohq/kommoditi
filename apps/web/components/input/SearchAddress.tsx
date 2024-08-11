import {
	IGeocoderFeature,
	IGeocoderResult,
	PlaceType,
	Region,
} from "@/typings";
import { parseMapBoxResultToRegion } from "@/utils/location.utils";
import { ContainedList, ContainedListItem, Search } from "@carbon/react";
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
	const [searchResults, setSearchResults] = useState<IGeocoderFeature[]>([]);

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

		const data: IGeocoderResult = await response.json();

		if (data.features && data.features.length > 0) {
			setSearchResults(data.features);
		} else {
			setSearchResults([]);
		}
	}, []);

	const handleResultSelect = useCallback(
		(result: IGeocoderFeature) => {
			const region = {
				id: result.id,
				name: result.place_name,
				locationType: result.place_type[0] as PlaceType,
				centerLng: result.center[0],
				centerLat: result.center[1],
			};
			onRegionSelect(region);
			setSearchResults([]);
			setQuery(region.name);
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
