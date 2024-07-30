"use client";

// Create a React Context Provider that exports token: CommodityToken with a hook useToken() that returns the token and isLoading state

import { useCommodity } from "@/hooks/useCommodity";
import { CommodityToken } from "@/typings";
import { createContext, useContext } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
	isLoading: boolean;
}

export const TokenContext = createContext<TokenContextProps>({
	commodity: {} as CommodityToken,
	isLoading: false,
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	address,
}: { children: React.ReactNode; address: string }) {
	const { commodity, isLoading } = useCommodity({
		address,
	});

	return (
		<TokenContext.Provider
			value={{ commodity: commodity as CommodityToken, isLoading }}
		>
			{children}
		</TokenContext.Provider>
	);
}
