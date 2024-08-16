import { Point } from "geojson";

export enum ParticipantType {
	PRODUCER = "PRODUCER",
	DISTRIBUTOR = "DISTRIBUTOR",
	CONSUMER = "CONSUMER",
}

export type Participant = {
	id: string;
	name: string;
	type: ParticipantType;
	overheadPercentage: number;
	locations: Region[];
};

export type Region = {
	id: string;
	name: string;
	h3Indexes: string[];
};

export type MapBoxViewState = {
	longitude: number;
	latitude: number;
	zoom: number;
};

export type ParticipantUserView = {
	id: string; // EthAddress
	createdAt: string;
	name?: string;
	locations: Region[];
};

/* MAPBOX TYPES */

export interface IGeocoderContext {
	id: string;
	wikidata: string;
	text: string;
}

export interface IGeocoderFeature {
	id: string;
	type: "Feature";
	place_type: Array<string>;
	relevance: number;
	properties: Object;
	address: string;
	text: string;
	place_name: string;
	bbox: [number, number, number, number];
	center: [number, number];
	geometry: Point;
	context: Array<IGeocoderContext>;
}

export interface IGeocoderResult {
	type: "FeatureCollection";
	query: Array<string | number>;
	features: Array<IGeocoderFeature>;
	attribution: string;
}

export interface IAddress {
	address?: string;
	postcode?: string;
	place?: string;
	locality?: string;
	country?: string;
	region?: string;
	disctrict?: string;
	neighborhood?: string;
	poi?: string;
}

/**
 * Various types of geographic features availabled in the Mapbox geocoder.
 *
 * @see https://docs.mapbox.com/api/search/#data-types
 */
export enum PlaceType {
	COUNTRY = "country",
	REGION = "region",
	POSTCODE = "postcode",
	DISTRICT = "district",
	PLACE = "place",
	LOCALITY = "locality",
	NEIGHBORHOOD = "neighborhood",
	ADDRESS = "address",
	POI = "poi",
}
