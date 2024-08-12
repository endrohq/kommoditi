import { isLocalNetwork } from "@/lib/constants";

export function formatNumber(num: number | string | bigint) {
	return commafy(roundNumber(Number(num) || 0));
}

export function commafy(num: number) {
	const str = num.toString().split(".");
	if (str[0].length >= 5) {
		str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
	}
	if (str[1] && str[1].length >= 5) {
		str[1] = str[1].replace(/(\d{3})/g, "$1");
	}
	return str.join(".");
}

export function roundNumber(value: number, digits = 2) {
	const tenToN = 10 ** digits;
	return Math.round(value * tenToN) / tenToN;
}

export function roundToTwoDecimals(value: number) {
	return Math.round(value * 100) / 100;
}

export const ETHEREUM_PRECISION = 1e18;
export const HEDERA_PRECISION = 1e8;
export const PRICE_RANGE_PRECISION = isLocalNetwork
	? ETHEREUM_PRECISION
	: HEDERA_PRECISION;
export function parseNumberToSmFormat(value: number) {
	return Math.round(value * PRICE_RANGE_PRECISION);
}

export function parseSmToNumberFormat(value: number) {
	return value / PRICE_RANGE_PRECISION;
}

export function normalizeCoordinate(coordinate: number) {
	// Multiply by 1e9 to preserve 9 decimal places
	return BigInt(Math.round(coordinate * 1e9));
}
