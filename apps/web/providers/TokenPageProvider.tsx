"use client";

import { CommodityToken, Region } from "@/typings";
import { createContext, useContext, useState } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
	countries: Region[];
	setCurrentPrice: (price: number) => void;
	currentPrice?: number;
}

export const TokenContext = createContext<TokenContextProps>({
	currentPrice: 0,
	countries: [],
	commodity: {} as CommodityToken,
	setCurrentPrice: () => {},
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	token,
	countries,
}: {
	children: React.ReactNode;
	token: CommodityToken | null;
	countries: Region[];
}) {
	const [currentPrice, setCurrentPrice] = useState<number>();
	console.log(countries);
	return (
		<TokenContext.Provider
			value={{
				currentPrice,
				commodity: token as CommodityToken,
				countries,
				setCurrentPrice: (p) => setCurrentPrice(p),
			}}
		>
			{children}
		</TokenContext.Provider>
	);
}
