import { formatDistance } from "date-fns";

export function getDistanceForDate(date: Date) {
	return formatDistance(new Date(date), new Date(), {
		addSuffix: true,
	});
}
