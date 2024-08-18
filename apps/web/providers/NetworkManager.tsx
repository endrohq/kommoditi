"use client";

import { NetworkOffline } from "@/components/NetworkOffline";
import { CommodityToken, ContractName } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import {
	getCommoditiesFromClient,
	getParticipants,
	getPoolTransactions,
} from "@/utils/sync.utils";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useEffect } from "react";
import { useAccount, useBlockNumber, useSwitchChain } from "wagmi";

interface UseNetworkManagerProps {
	blockNumber?: bigint;
	signalNewTx(contractName: ContractName): Promise<void>;
}

const BLOCKCHAIN_API_ENDPOINT = "/api/blockchain";

const SYNC_INTERVAL = 3000000; // 3000 seconds

export const NetworkManagerContext = createContext<UseNetworkManagerProps>({
	blockNumber: undefined,
	signalNewTx: async () => {},
});

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

	async function checkAndSync(contractNames?: ContractName[]) {
		const blockNumberOnApi = await fetchWrapper<number>(
			BLOCKCHAIN_API_ENDPOINT,
		);

		if (blockNumberOnApi < Number(currentBlockNumber)) {
			if (!currentBlockNumber) return;
			let commodities: CommodityToken[] = [];
			if (contractNames?.includes("tokenAuthority")) {
				commodities = await getCommoditiesFromClient(Number(chainId));
			}

			if (contractNames?.includes("participantRegistry")) {
				await getParticipants(BigInt(blockNumberOnApi), currentBlockNumber);
			}

			if (commodities?.length > 0 && contractNames?.includes("commodityPool")) {
				await getPoolTransactions(
					BigInt(blockNumberOnApi),
					currentBlockNumber,
					commodities,
				);
			}

			// Finalise our data sync with supabase by updating the blockNumber
			await fetchWrapper<number>(BLOCKCHAIN_API_ENDPOINT, {
				method: "POST",
				body: JSON.stringify({ blockNumber: Number(currentBlockNumber) }),
			});
		}
	}

	useEffect(() => {
		if (ready && currentBlockNumber) {
			checkAndSync([
				"participantRegistry",
				"commodityPool",
				"tokenAuthority",
				"commodityExchange",
			]);
		}
		const interval = setInterval(checkAndSync, SYNC_INTERVAL);
		return () => clearInterval(interval);
	}, [ready, currentBlockNumber]);

	return (
		<NetworkManagerContext.Provider
			value={{
				blockNumber: currentBlockNumber,
				signalNewTx: (contractName: ContractName) =>
					checkAndSync([contractName]),
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
