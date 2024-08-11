import { IGeocoderFeature, PlaceType, Region } from "@/typings";
import { Feature, Geometry } from "geojson";
const geoJson = require("world-geojson");

export function parseMapBoxResultToRegion(result: IGeocoderFeature): Region {
	return {
		id: result.id,
		name: result.place_name,
		locationType: (result.place_type[0] as PlaceType) || PlaceType.POI,
		centerLng: result.center[0],
		centerLat: result.center[1],
	};
}

export function getGeometryForRegion(region: Region): Feature<Geometry> {
	if (region.locationType === PlaceType.COUNTRY) {
		const countryName = region.name.toLowerCase().replace(/\s/g, "_");
		const countryData = geoJson.forCountry(countryName);
		return {
			type: "Feature",
			properties: { name: region.name },
			geometry: countryData.features[0].geometry,
		};
	} else {
		// For non-country types, create a point feature
		return {
			type: "Feature",
			properties: { name: region.name },
			geometry: {
				type: "Point",
				coordinates: [region.centerLng, region.centerLat],
			},
		};
	}
}
