import { LocationItem } from "@/typings";
import { ContainedList, ContainedListItem, Search } from "@carbon/react";
import { latLngToCell } from "h3-js";
import debounce from "lodash.debounce";
import React, { useState } from "react";

interface SearchAddressProps {
	setLocation: (location: LocationItem) => void;
	placeholder?: string;
}

const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function SearchAddress({
	setLocation,
	placeholder = "Search for an address",
}: SearchAddressProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<LocationItem[]>([]);

	const handleAddressSearch = async (query: string) => {
		if (!query) {
			setSearchResults([]);
			return;
		}

		const response = await fetch(
			`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxAccessToken}`,
		);
		const data = await response.json();

		if (data.features && data.features.length > 0) {
			const results: LocationItem[] = data.features.map((feature: any) => ({
				id: feature.id,
				text: feature.place_name,
				lng: feature.center[0],
				lat: feature.center[1],
				h3Index: latLngToCell(feature.center[1], feature.center[0], 9),
			}));
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	};

	function handleLocationSelect(location: LocationItem) {
		setLocation(location);
		setSearchResults([]);
	}

	const debouncedHandleAddressSearch = debounce(handleAddressSearch, 300);

	return (
		<ContainedList label="List title" kind="on-page" action={""}>
			<Search
				labelText="Location"
				placeholder={placeholder}
				onChange={(e) => {
					setQuery(e.target.value);
					debouncedHandleAddressSearch(e.target.value);
				}}
				value={query}
			/>
			{searchResults.map((listItem, key) => (
				<ContainedListItem
					key={key}
					onClick={() => handleLocationSelect(listItem)}
					className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
				>
					{listItem?.text}
				</ContainedListItem>
			))}
		</ContainedList>
	);
}
