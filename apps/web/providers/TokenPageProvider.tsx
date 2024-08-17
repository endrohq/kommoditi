"use client";

import { CommodityToken, Region } from "@/typings";
import { createContext, useContext, useState } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
	countries: Region[];
	currentPrice?: number;
}

export const TokenContext = createContext<TokenContextProps>({
	currentPrice: 0,
	countries: [],
	commodity: {} as CommodityToken,
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	token,
	countries,
	currentPrice,
}: {
	children: React.ReactNode;
	token: CommodityToken | null;
	countries: Region[];
	currentPrice: number;
}) {
	return (
		<TokenContext.Provider
			value={{
				currentPrice,
				commodity: token as CommodityToken,
				countries,
			}}
		>
			{children}
		</TokenContext.Provider>
	);
}
