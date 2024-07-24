export const PROFILE_ROUTE_ITEM = "/profile/:address";
export const HOME_ROUTE = "/";
export const ROUTE_ADMIN_PAGE = "/admin";
export const ROUTE_REGISTER_PAGE = "/register";

export function getProfileRoute(address: string = "") {
	return PROFILE_ROUTE_ITEM.replace(":address", address);
}
