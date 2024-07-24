export const PROFILE_ROUTE_ITEM = "/profile/:address";
export const ROUTE_HOME = "/";
export const ROUTE_ADMIN_PAGE = "/admin";
export const ROUTE_MINT_PAGE = "/mint";
export const ROUTE_REGISTER_PAGE = "/register";

export function getProfileRoute(address: string = "") {
	return PROFILE_ROUTE_ITEM.replace(":address", address);
}
