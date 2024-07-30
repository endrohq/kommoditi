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

export function isInvalidNumber(value?: bigint) {
	return isNaN(Number(value));
}

export function roundToTwoDecimals(value: number) {
	return Math.round(value * 100) / 100;
}

export const PRICE_RANGE_PRECISION = 1e2;
export function parseNumberToSmFormat(value: number) {
	return Math.round(value * PRICE_RANGE_PRECISION);
}

export function parseSmToNumberFormat(value: number) {
	return value / PRICE_RANGE_PRECISION;
}
