"use server";

import { networkId } from "@/lib/constants";
import {
	CommodityGroup,
	CommodityToken,
	OwnerQuantity,
	ParticipantType,
	ParticipantUserView,
	PlaceType,
	Region,
} from "@/typings";
import {
	getCountryNameFromAddress,
	labelCommodity,
} from "@/utils/commodity.utils";
import supabase from "../../utils/supabase.utils";

export async function fetchCommodity(tokenAddress: string) {
	const { data: commodity, error } = await supabase
		.from("commodityToken")
		.select("*")
		.eq("tokenAddress", tokenAddress.toLowerCase())
		.eq("chainId", networkId)
		.single<CommodityToken>();

	return commodity;
}

export async function fetchLatestPrice(tokenAddress: string) {
	const { data: prices } = await supabase
		.from("commodityPrice")
		.select("price")
		.eq("tokenAddress", tokenAddress)
		.eq("chainId", networkId)
		.order("createdAt", { ascending: false })
		.limit(1);

	return prices?.[0]?.price;
}

export async function getCountriesWhereCommodityTokenIsActiveIn(
	tokenAddress: string,
) {
	const { data: commodities, error } = await supabase
		.from("listing")
		.select("producerId")
		.eq("chainId", networkId)
		.eq("tokenAddress", tokenAddress);

	if (error) {
		console.error("Error fetching commodities:", error);
		throw new Error("Failed to fetch commodities");
	}

	const producerIds: string[] = Array.from(
		new Set(commodities.map((c) => c.producerId)),
	);

	const { data: producers } = await supabase
		.from("participant")
		.select("*,locations:location(*)")
		.in("id", producerIds)
		.eq("chainId", networkId)
		.returns<ParticipantUserView[]>();

	const countryNames = (producers || [])
		.map((producer) => {
			const location = producer?.locations?.[0] as Region; // Assuming the first location is the primary one
			return getCountryNameFromAddress(location.name);
		})
		?.filter((c) => !!c || c !== null);

	return Array.from(new Set(countryNames)).map(
		(c) =>
			({
				id: c,
				name: c,
				locationType: PlaceType.COUNTRY,
				centerLng: 0,
				centerLat: 0,
			}) as Region,
	);
}

type FetchCommoditiesOptions = {
	tokenAddress?: string;
};

export async function fetchCommoditiesGroupedByCountry({
	tokenAddress,
}: FetchCommoditiesOptions): Promise<CommodityGroup[]> {
	const producers = await fetchParticipantsWithLocations(
		ParticipantType.PRODUCER,
	);

	const query = supabase.from("commodity").select(`
      *,
      commodityToken(*),
      participant:producerId(*)
    `);

	if (tokenAddress) {
		query.eq("tokenAddress", tokenAddress);
	}

	const { data: commodities, error } = await query;

	console.log(commodities);
	if (error) {
		console.error("Error fetching commodities:", error);
		throw new Error("Failed to fetch commodities");
	}

	// Group commodities by country and token
	const groupedCommodities = commodities.reduce(
		(acc, commodity) => {
			const producer = producers.find((p) => p.id === commodity.producerId);
			if (!producer) {
				return acc;
			}
			const location = producer?.locations?.[0] as Region; // Assuming the first location is the primary one
			const country = getCountryNameFromAddress(location.name) || "";
			const groupLabel = labelCommodity(
				location.name,
				commodity.commodityToken?.name,
			);

			if (!acc[groupLabel]) {
				acc[groupLabel] = {
					token: commodity.commodityToken,
					label: groupLabel,
					country: country,
					quantity: 0,
					owners: [],
				} as CommodityGroup;
			}
			acc[groupLabel].quantity += 1;

			// Update owner quantities
			const ownerIndex = acc[groupLabel].owners.findIndex(
				(oq: OwnerQuantity) => oq.ownerId === commodity.currentOwnerId,
			);
			if (ownerIndex === -1) {
				acc[groupLabel].owners.push({
					ownerId: commodity.currentOwnerId,
					quantity: 1,
				});
			} else {
				acc[groupLabel].owners[ownerIndex].quantity += 1;
			}

			return acc;
		},
		{} as Record<string, CommodityGroup>,
	);

	return Object.values(groupedCommodities);
}

export async function fetchParticipantsWithLocations(
	type?: ParticipantType,
): Promise<ParticipantUserView[]> {
	const query = supabase.from("participant").select("*,locations:location(*)");

	if (type) {
		query.eq("type", type);
	}

	const { data, error } = await query;

	return data || ([] as ParticipantUserView[]);
}
