"use client";

import { CommodityToken } from "@/typings";
import { createContext, useContext, useState } from "react";

interface TokenContextProps {
	commodity: CommodityToken;
	setCurrentPrice: (price: number) => void;
	currentPrice?: number;
}

export const TokenContext = createContext<TokenContextProps>({
	currentPrice: 0,
	commodity: {} as CommodityToken,
	setCurrentPrice: () => {},
});

export function useTokenPage() {
	return useContext(TokenContext);
}

export function TokenPageProvider({
	children,
	token,
}: { children: React.ReactNode; token: CommodityToken | null }) {
	const [currentPrice, setCurrentPrice] = useState<number>();
	console.log(currentPrice);
	return (
		<TokenContext.Provider
			value={{
				currentPrice,
				commodity: token as CommodityToken,
				setCurrentPrice: (p) => setCurrentPrice(p),
			}}
		>
			{children}
		</TokenContext.Provider>
	);
}
