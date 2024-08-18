import {
	IGeocoderFeature,
	IGeocoderResult,
	PlaceType,
	Region,
} from "@/typings";
import debounce from "lodash.debounce";
import React, { useState, useCallback } from "react";

import Select, { SingleValue } from "react-select";

interface SearchAddressProps {
	onRegionSelect: (region: Region) => void;
	placeholder?: string;
	allowTypes?: PlaceType[];
}

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function SearchAddress({
	onRegionSelect,
	placeholder = "Search for an address",
	allowTypes = Object.values(PlaceType),
}: SearchAddressProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<IGeocoderFeature[]>([]);

	const handleAddressSearch = useCallback(async (query: string) => {
		if (!query || query?.length < 2) {
			setSearchResults([]);
			return;
		}

		const response = await fetch(
			`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
				query,
			)}.json?access_token=${mapboxAccessToken}&types=${allowTypes.join(",")}`,
		);

		if (response.ok) {
			const data: IGeocoderResult = await response.json();
			if (data.features && data.features.length > 0) {
				setSearchResults(data.features);
			} else {
				setSearchResults([]);
			}
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

	const options = searchResults.map((result) => ({
		label: result.place_name,
		value: result.id,
	}));

	return (
		<>
			<Select
				options={options}
				value={query as any}
				placeholder={placeholder}
				isSearchable
				onChange={(
					selectedOption: SingleValue<{ value: string; label: string }>,
				) => {
					if (!selectedOption?.value) return;

					const result = searchResults.find(
						(result) => result.id === selectedOption?.value,
					);
					if (result) {
						handleResultSelect(result);
						setQuery("");
					}
				}}
				isMulti={false}
				onInputChange={(inputValue) => debouncedHandleAddressSearch(inputValue)}
				noOptionsMessage={() => "No results found"}
				className="!text-sm"
			/>
		</>
	);
}
