export const PROFILE_ROUTE_ITEM = "/profile/:address";
export const HOME_ROUTE = "/";

export function getProfileRoute(address: string = "") {
	return PROFILE_ROUTE_ITEM.replace(":address", address);
}
