import { isLocalNetwork } from "@/lib/constants";

export const PROFILE_ROUTE_ITEM = "/profile/:address";
export const ROUTE_HOME = "/";
export const ROUTE_ADMIN_PAGE = "/admin";
export const ROUTE_MINT_PAGE = "/mint";
export const ROUTE_USERS_PAGE = "/users";
export const ROUTE_TOKEN_PAGE = "/tokens/:address";

export function getProfileRoute(address: string = "") {
	return PROFILE_ROUTE_ITEM.replace(":address", address);
}

export function getTransactionRoute(hash: string = "") {
	return isLocalNetwork
		? `http://localhost:3000/tx/tash`
		: `https://explorer.kabuto.sh/testnet/transactions/${hash}`;
}

export function getTokenPage(address: string = "") {
	return ROUTE_TOKEN_PAGE.replace(":address", address);
}
