"use client";

import { NetworkOffline } from "@/components/NetworkOffline";
import { CommodityToken, ContractName } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import {
	extractParticipant,
	getCommoditiesFromClient,
	getParticipants,
	getPoolTransactions,
	saveParticipants,
	syncCommodity,
} from "@/utils/sync.utils";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useEffect, useContext } from "react";
import { useAccount, useBlockNumber, useSwitchChain } from "wagmi";

interface UseNetworkManagerProps {
	blockNumber?: bigint;
	signalNewTx(contractName: ContractName): Promise<void>;
	signalNewToken(tokenAddress: string, poolAddress: string): Promise<void>;
	signalNewParticipant(
		name: string,
		participant: string,
		participantType: number,
		locations: any[],
		overheadPercentage: number,
	): Promise<void>;
}

const BLOCKCHAIN_API_ENDPOINT = "/api/blockchain";

const SYNC_INTERVAL = 3000000; // 3000 seconds

export const NetworkManagerContext = createContext<UseNetworkManagerProps>({
	blockNumber: undefined,
	signalNewTx: async () => {},
	signalNewToken: async () => {},
	signalNewParticipant: async () => {},
});

export const useNetworkManager = () => useContext(NetworkManagerContext);

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
		let blockNumberOnApi = await fetchWrapper<number>(BLOCKCHAIN_API_ENDPOINT);
		console.log("blockNumberOnApi", blockNumberOnApi?.toString());

		if (
			(blockNumberOnApi === undefined ||
				blockNumberOnApi === null ||
				blockNumberOnApi === 0) &&
			currentBlockNumber
		) {
			blockNumberOnApi = Number(currentBlockNumber - BigInt(1000));
		}

		if (blockNumberOnApi < Number(currentBlockNumber)) {
			if (!currentBlockNumber) return;
			let commodities: CommodityToken[] = [];
			if (contractNames?.includes("tokenAuthority")) {
				commodities = await getCommoditiesFromClient(
					BigInt(blockNumberOnApi),
					currentBlockNumber,
				);
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

	async function signalNewToken(tokenAddress: string, poolAddress: string) {
		await syncCommodity([{ tokenAddress, poolAddress }]);
	}

	async function signalNewParticipant(
		name: string,
		address: string,
		participantType: number,
		locations: any[],
		overheadPercentage: number,
	) {
		const participant = extractParticipant(
			name,
			address,
			participantType,
			locations,
			overheadPercentage,
		);
		await saveParticipants([participant]);
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
				signalNewToken,
				signalNewParticipant,
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
