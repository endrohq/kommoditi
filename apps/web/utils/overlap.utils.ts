import { ParticipantType, ParticipantUserView, Region } from "@/typings";
import booleanIntersects from "@turf/boolean-intersects";

import { getGeometryForRegion } from "./location.utils";

function doRegionsOverlap(region1: Region, region2: Region): boolean {
	const geometry1 = getGeometryForRegion(region1);
	const geometry2 = getGeometryForRegion(region2);

	return booleanIntersects(geometry1, geometry2);
}

function hasAnyOverlap(regions1: Region[], regions2: Region[]): boolean {
	for (const region1 of regions1) {
		for (const region2 of regions2) {
			if (doRegionsOverlap(region1, region2)) {
				return true;
			}
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
				// Consumers can only find CTFs operating in their location
				if (
					participant.type === ParticipantType.CTF &&
					hasAnyOverlap(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;

			case ParticipantType.CTF:
				// CTFs can see both producers and consumers
				if (
					(participant.type === ParticipantType.PRODUCER ||
						participant.type === ParticipantType.CONSUMER) &&
					hasAnyOverlap(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;

			case ParticipantType.PRODUCER:
				// Producers can find CTFs they can sell to
				if (
					participant.type === ParticipantType.CTF &&
					hasAnyOverlap(activeParticipantRegions, participantRegions)
				) {
					tradingPartners.push(participant.id);
				}
				break;
		}
	}

	return tradingPartners;
}
