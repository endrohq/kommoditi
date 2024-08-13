"use client";

import { CommodityToken } from "@/typings";
import { createContext, useContext } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
}

export const TokenContext = createContext<TokenContextProps>({
	commodity: {} as CommodityToken,
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	token,
}: { children: React.ReactNode; token: CommodityToken | null }) {
	return (
		<TokenContext.Provider value={{ commodity: token as CommodityToken }}>
			{children}
		</TokenContext.Provider>
	);
}
