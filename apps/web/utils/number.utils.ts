export function formatNumber(num: number | string) {
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
