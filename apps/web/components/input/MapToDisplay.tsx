"use client";
import React, { useEffect, useRef, useMemo } from "react";
import Map, { Source, Layer, MapRef, Marker } from "react-map-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPinOutlined } from "@/components/icons/MapPinOutlined";
import { MapBoxViewState, Region } from "@/typings";
import { getGeometryForRegion } from "@/utils/location.utils";
import mapboxgl from "mapbox-gl";

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

	const regionsData = useMemo(() => {
		return regions.map((region) => ({
			region,
			geometry: getGeometryForRegion(region),
		}));
	}, [regions]);

	useEffect(() => {
		if (mapRef.current && regionsData.length > 0) {
			const bounds = new mapboxgl.LngLatBounds();
			regionsData.forEach(({ geometry }) => {
				if (geometry.geometry.type === "Point") {
					bounds.extend(geometry.geometry.coordinates as [number, number]);
				} else if (geometry.geometry.type === "Polygon") {
					geometry.geometry.coordinates[0].forEach((coord) =>
						bounds.extend(coord as [number, number]),
					);
				} else if (geometry.geometry.type === "MultiPolygon") {
					geometry.geometry.coordinates.forEach((polygon) => {
						polygon[0].forEach((coord) =>
							bounds.extend(coord as [number, number]),
						);
					});
				}
			});
			mapRef.current.fitBounds(bounds, { padding: 40, duration: 1000 });
		}
	}, [regionsData]);

	return (
		<Map
			fi
			ref={mapRef}
			initialViewState={initialViewState}
			style={{
				width: "100%",
				height: mapHeight || "calc(100vh - 47px)",
				zIndex: "-1 !important",
			}}
			mapStyle="mapbox://styles/mapbox/light-v11"
			mapboxAccessToken={MAPBOX_TOKEN}
			interactiveLayerIds={["region-fills"]}
		>
			{regionsData.map(({ region, geometry }) =>
				geometry.geometry.type === "Point" ? (
					<Marker
						key={region.id}
						longitude={region.centerLng}
						latitude={region.centerLat}
					>
						<div title={region.name}>
							<MapPinOutlined className="text-3xl" />
						</div>
					</Marker>
				) : (
					<Source
						key={region.id}
						id={`region-${region.id}`}
						type="geojson"
						data={geometry}
					>
						<Layer
							id={`region-fills-${region.id}`}
							type="fill"
							paint={{
								"fill-color": "#088",
								"fill-opacity": 0.5,
							}}
						/>
						<Layer
							id={`region-borders-${region.id}`}
							type="line"
							paint={{
								"line-color": "#088",
								"line-width": 2,
							}}
						/>
					</Source>
				),
			)}
		</Map>
	);
};
