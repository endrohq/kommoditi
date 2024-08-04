import React, { useEffect, useRef } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapBoxViewState, Region } from "@/typings";
import { cellToBoundary } from "h3-js";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MapWithRegionsProps {
	initialViewState?: MapBoxViewState;
	mapHeight?: number;
	regions: Region[];
}

export const MapToDisplay: React.FC<MapWithRegionsProps> = ({
	initialViewState = {
		longitude: -96.7101733,
		latitude: 32.9982438,
		zoom: 9,
	},
	regions,
	mapHeight,
}) => {
	const mapRef = useRef<MapRef>(null);

	const fitMapToRegions = (regions: Region[]) => {
		if (!mapRef.current) return;

		let minLng = Infinity;
		let minLat = Infinity;
		let maxLng = -Infinity;
		let maxLat = -Infinity;

		regions.forEach((region) => {
			region.h3Indexes.forEach((h3Index) => {
				const boundary = cellToBoundary(h3Index);
				boundary.forEach(([lat, lng]) => {
					minLng = Math.min(minLng, lng);
					minLat = Math.min(minLat, lat);
					maxLng = Math.max(maxLng, lng);
					maxLat = Math.max(maxLat, lat);
				});
			});
		});

		mapRef.current.fitBounds(
			[
				[minLng, minLat],
				[maxLng, maxLat],
			],
			{ padding: 40, duration: 1000 },
		);
	};

	useEffect(() => {
		if (mapRef.current && regions.length > 0) {
			fitMapToRegions(regions);
		}
	}, [regions]);

	const regionsGeoJSON: GeoJSON.FeatureCollection = {
		type: "FeatureCollection",
		features: regions?.map((region) => ({
			type: "Feature",
			geometry: {
				type: "MultiPolygon",
				coordinates: region.h3Indexes.map((h3Index) => {
					const boundary = cellToBoundary(h3Index);
					return [boundary.map(([lat, lng]) => [lng, lat])];
				}),
			},
			properties: { id: region.id },
		})),
	};

	return (
		<Map
			ref={mapRef}
			initialViewState={initialViewState}
			style={{
				width: "100%",
				height: mapHeight || "calc(100vh - 47px)",
				zIndex: "-1 !important",
			}}
			mapStyle="mapbox://styles/mapbox/light-v10"
			mapboxAccessToken={MAPBOX_TOKEN}
			interactiveLayerIds={["region-fills"]}
		>
			<Source id="regions" type="geojson" data={regionsGeoJSON}>
				<Layer
					id="region-fills"
					type="fill"
					paint={{
						"fill-color": "#088",
						"fill-opacity": 0.5,
					}}
				/>
				<Layer
					id="region-borders"
					type="line"
					paint={{
						"line-color": "#088",
						"line-width": 2,
					}}
				/>
				<Layer
					id="region-labels"
					type="symbol"
					layout={{
						"text-field": ["get", "name"],
						"text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
						"text-size": 12,
						"text-anchor": "center",
					}}
					paint={{
						"text-color": "#ffffff",
						"text-halo-color": "#000000",
						"text-halo-width": 1,
					}}
				/>
			</Source>
		</Map>
	);
};
