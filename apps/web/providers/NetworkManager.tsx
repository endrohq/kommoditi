"use client";

import { NetworkOffline } from "@/components/NetworkOffline";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useEffect } from "react";
import { useBlockNumber, useChainId, useSwitchChain } from "wagmi";

export const NetworkManagerContext = createContext({});

type AuthProviderProps = {
	children: ReactNode;
};

export default function NetworkManager({ children }: AuthProviderProps) {
	const { ready } = usePrivy();
	const chainId = useChainId();
	const { chains, switchChain } = useSwitchChain();
	const { data, isError, error } = useBlockNumber();

	useEffect(() => {
		if (!ready) return;

		if (chains && chains.length > 0) {
			const activeChain = chains?.find((a) => chainId === Number(a?.id));
			if (!activeChain) {
				switchChain({ chainId: Number(chains[0]?.id) });
			}
		}
	}, [chains, ready]);

	return (
		<NetworkManagerContext.Provider value={{}}>
			{isNaN(Number(data)) && (
				<NetworkOffline
					activeChain={chains?.find((a) => chainId === Number(a?.id))}
				/>
			)}
			{children}
		</NetworkManagerContext.Provider>
	);
}
