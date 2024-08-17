import {
	fetchCommodity,
	getCountriesWhereCommodityTokenIsActiveIn,
} from "@/app/(main)/actions";
import { TokenPageProvider } from "@/providers/TokenPageProvider";
import React from "react";

interface LayoutProps {
	params: {
		address: string;
	};
	children: React.ReactNode;
}

export default async function Layout({ params, children }: LayoutProps) {
	const [token, countries] = await Promise.all([
		fetchCommodity(params.address),
		getCountriesWhereCommodityTokenIsActiveIn(params.address),
	]);
	console.log(countries);
	return (
		<TokenPageProvider countries={countries} token={token}>
			{children}
		</TokenPageProvider>
	);
}
