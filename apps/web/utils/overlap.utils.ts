import { ParticipantType, ParticipantUserView, Region } from "@/typings";
import { getCountryNameFromAddress } from "./commodity.utils";

function getCountriesForRegions(regions: Region[]): Set<string> {
	const countries = new Set<string>();
	for (const region of regions) {
		if (region.locationType === "country") {
			countries.add(region.name);
		} else {
			const country = getCountryNameFromAddress(region.name);
			if (country) {
				countries.add(country);
			}
		}
	}
	return countries;
}

function hasOverlappingCountries(
	regions1: Region[],
	regions2: Region[],
): boolean {
	const countries1 = getCountriesForRegions(regions1);
	const countries2 = getCountriesForRegions(regions2);

	for (const country of Array.from(countries1)) {
		if (countries2.has(country)) {
			return true;
		}
	}
	return false;
}

export function findTradingPartners(
	participants: ParticipantUserView[],
	activeParticipant?: ParticipantUserView,
): string[] {
	if (!activeParticipant || !activeParticipant.locations.length) return [];

	const tradingPartners: string[] = [];
	const activeParticipantRegions = activeParticipant.locations;

	for (const participant of participants) {
		if (participant.id === activeParticipant.id) continue;

		const participantRegions = participant.locations;

		switch (activeParticipant.type) {
			case ParticipantType.CONSUMER:
				// Consumers can only find DISTRIBUTORs operating in their location
				if (
					participant.type === ParticipantType.DISTRIBUTOR &&
					hasOverlappingCountries(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;

			case ParticipantType.DISTRIBUTOR:
				// DISTRIBUTORs can see both producers and consumers
				if (
					(participant.type === ParticipantType.PRODUCER ||
						participant.type === ParticipantType.CONSUMER) &&
					hasOverlappingCountries(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;

			case ParticipantType.PRODUCER:
				// Producers can find DISTRIBUTORs they can sell to
				if (
					participant.type === ParticipantType.DISTRIBUTOR &&
					hasOverlappingCountries(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;
		}
	}

	return tradingPartners;
}
