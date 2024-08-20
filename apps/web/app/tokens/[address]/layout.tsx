import {
	fetchCommodity,
	fetchLatestPrice,
	getCountriesWhereCommodityTokenIsActiveIn,
} from "@/app/actions";
import { TokenPageProvider } from "@/providers/TokenPageProvider";
import React from "react";

interface LayoutProps {
	params: {
		address: string;
	};
	children: React.ReactNode;
}

export default async function Layout({ params, children }: LayoutProps) {
	const [token, currentPrice] = await Promise.all([
		fetchCommodity(params.address),
		fetchLatestPrice(params.address),
	]);

	return (
		<TokenPageProvider token={token} currentPrice={currentPrice}>
			{children}
		</TokenPageProvider>
	);
}
