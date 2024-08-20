"use client";

import { CommodityToken, Region } from "@/typings";
import { createContext, useContext, useState } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
	countries: Region[];
	currentPrice?: number;
	setCountries: (countries: Region[]) => void;
}

export const TokenContext = createContext<TokenContextProps>({
	currentPrice: 0,
	countries: [],
	commodity: {} as CommodityToken,
	setCountries: () => {},
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	token,
	currentPrice,
}: {
	children: React.ReactNode;
	token: CommodityToken | null;

	currentPrice: number;
}) {
	const [countries, setCountries] = useState<Region[]>([]);
	return (
		<TokenContext.Provider
			value={{
				currentPrice,
				commodity: token as CommodityToken,
				countries,
				setCountries,
			}}
		>
			{children}
		</TokenContext.Provider>
	);
}
