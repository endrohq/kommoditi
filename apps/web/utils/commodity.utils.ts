import lookup from "country-code-lookup";
import nationalities from "i18n-nationality";

export function getCountryNameFromAddress(address: string): string | null {
	const words = address.split(",").map((word) => word.trim());
	for (let i = words.length - 1; i >= 0; i--) {
		const country = lookup.byCountry(words[i]);
		if (country) {
			return country.country;
		}
	}
	return null;
}

export function getCountryCodeFromAddress(address: string): string | null {
	const words = address.split(",").map((word) => word.trim());
	for (let i = words.length - 1; i >= 0; i--) {
		const country = lookup.byCountry(words[i]);
		if (country) {
			return country.iso2;
		}
	}
	return null;
}

export function labelCommodity(address: string, commodity: string): string {
	const countryCode = getCountryCodeFromAddress(address);
	if (!countryCode) {
		return `${commodity} (Unknown origin)`;
	}
	const demonym = nationalities.getName(countryCode, "en") as string;
	return `${demonym} ${commodity}`;
}
