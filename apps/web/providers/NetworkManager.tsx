"use client";

import { NetworkOffline } from "@/components/NetworkOffline";
import { fetchWrapper } from "@/utils/fetch.utils";
import { getCommoditiesFromClient } from "@/utils/sync.utils";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useEffect } from "react";
import { useAccount, useBlockNumber, useChainId, useSwitchChain } from "wagmi";

interface UseNetworkManagerProps {
	blockNumber?: bigint;
}

const SYNC_INTERVAL = 30000; // 30 seconds

export const NetworkManagerContext = createContext<UseNetworkManagerProps>({});

export const useNetworkManager = () => React.useContext(NetworkManagerContext);

type AuthProviderProps = {
	children: ReactNode;
};

export default function NetworkManager({ children }: AuthProviderProps) {
	const { ready } = usePrivy();
	const { chainId } = useAccount();
	const { chains, switchChain } = useSwitchChain();
	const { data: currentBlockNumber } = useBlockNumber();

	useEffect(() => {
		if (!ready) return;

		if (chains && chains.length > 0) {
			const activeChain = chains?.find((a) => chainId === Number(a?.id));
			if (!activeChain) {
				switchChain({ chainId: Number(chains[0]?.id) });
			}
		}
	}, [chains, ready]);

	useEffect(() => {
		const checkAndSync = async () => {
			const blockNumberOnApi = await fetchWrapper<number>("/api/blockchain");
			if (blockNumberOnApi < Number(currentBlockNumber)) {
				// sync the commodities
				await getCommoditiesFromClient(Number(chainId));

				// Finalise our data sync with supabase by updating the blockNumber
				await fetchWrapper<number>("/api/blockchain", {
					method: "POST",
					body: JSON.stringify({ blockNumber: Number(currentBlockNumber) }),
				});
			}
		};

		if (ready && currentBlockNumber) {
			checkAndSync();
		}

		const interval = setInterval(checkAndSync, SYNC_INTERVAL);
		return () => clearInterval(interval);
	}, [ready, currentBlockNumber]);

	return (
		<NetworkManagerContext.Provider
			value={{
				blockNumber: currentBlockNumber,
			}}
		>
			{isNaN(Number(currentBlockNumber)) && ready && (
				<NetworkOffline
					activeChain={chains?.find((a) => chainId === Number(a?.id))}
				/>
			)}
			{children}
		</NetworkManagerContext.Provider>
	);
}
