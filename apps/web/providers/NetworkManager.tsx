"use client";

import { NetworkOffline } from "@/components/NetworkOffline";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useEffect } from "react";
import { useAccount, useBlockNumber, useChainId, useSwitchChain } from "wagmi";

interface UseNetworkManagerProps {
	blockNumber?: bigint;
}

export const NetworkManagerContext = createContext<UseNetworkManagerProps>({});

export const useNetworkManager = () => React.useContext(NetworkManagerContext);

type AuthProviderProps = {
	children: ReactNode;
};

export default function NetworkManager({ children }: AuthProviderProps) {
	const { ready } = usePrivy();
	const { chainId } = useAccount();
	const { chains, switchChain } = useSwitchChain();
	const { data } = useBlockNumber();

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
		<NetworkManagerContext.Provider
			value={{
				blockNumber: data,
			}}
		>
			{isNaN(Number(data)) && ready && (
				<NetworkOffline
					activeChain={chains?.find((a) => chainId === Number(a?.id))}
				/>
			)}
			{children}
		</NetworkManagerContext.Provider>
	);
}
