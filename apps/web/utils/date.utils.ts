import { formatDistance } from "date-fns";

export function getDistanceForDate(date: Date) {
	return formatDistance(new Date(date), new Date(), {
		addSuffix: true,
	});
}

export function parseSmartContractDate(date: bigint) {
	return new Date(Number(date) * 1000);
}
