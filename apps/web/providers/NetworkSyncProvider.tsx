import { contracts } from "@/lib/constants";
import { EthAddress, PoolTransaction } from "@/typings";
import { formatNumber } from "@/utils/number.utils";
import React, { createContext, useContext, useEffect, useState } from "react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";

const { commodityPool } = contracts;

const POLLING_INTERVAL = 10000; // 10 seconds

type NetworkSyncContextType = {
	isLoading: boolean;
	lastSyncedBlock: bigint;
};

const NetworkSyncContext = createContext<NetworkSyncContextType | undefined>(
	undefined,
);

/*export const useNetworkSync = () => {
	const context = useContext(NetworkSyncContext);
	if (!context) {
		throw new Error("useNetworkSync must be used within a NetworkSyncProvider");
	}
	return context;
};*/

type NetworkSyncProviderProps = {
	children: React.ReactNode;
	poolAddresses: EthAddress[];
};

const eventNames = [
	"ListingAdded",
	"ListingSold",
	"LiquidityChanged",
	"CTFPurchase",
	"FPPurchase",
];

export const NetworkSyncProvider: React.FC<NetworkSyncProviderProps> = ({
	children,
	poolAddresses,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [lastSyncedBlock, setLastSyncedBlock] = useState<bigint>(BigInt(0));
	const publicClient = usePublicClient();

	const fetchAndStoreTransactions = async (
		fromBlock: bigint,
		toBlock: bigint,
	) => {
		if (!publicClient) return;

		const events = await publicClient.getLogs({
			address: poolAddresses,
			events: commodityPool.abi.filter((event) =>
				// @ts-ignore
				eventNames.includes(event.name ?? ""),
			),
			fromBlock,
			toBlock,
		});

		const transactions = await Promise.all(
			events.map(async (log) => {
				const block = await publicClient.getBlock({
					blockNumber: log.blockNumber,
				});

				const fullTx = await publicClient.getTransaction({
					hash: log.transactionHash,
				});

				return {
					type: log.eventName ?? "unknown",
					transactionHash: log.transactionHash,
					from: fullTx.from,
					to: fullTx.to,
					value: formatNumber(formatEther(fullTx.value)),
					blockNumber: BigInt(log.blockNumber),
					dateCreated: block
						? new Date(Number(block.timestamp) * 1000)
						: new Date(0),
					args: log.args,
				} as PoolTransaction;
			}),
		);

		// Store transactions in Supabase
		await storeTransactionsInSupabase(transactions);

		setLastSyncedBlock(toBlock);
		setIsLoading(false);
	};

	const storeTransactionsInSupabase = async (
		transactions: PoolTransaction[],
	) => {
		const response = await fetch("/api/transactions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ transactions }),
		});

		if (!response.ok) {
			console.error("Failed to store transactions");
		}
	};

	useEffect(() => {
		const syncTransactions = async () => {
			const latestBlock = await publicClient?.getBlockNumber();
			if (!latestBlock) return;
			await fetchAndStoreTransactions(lastSyncedBlock + BigInt(1), latestBlock);
		};

		syncTransactions();
		const intervalId = setInterval(syncTransactions, POLLING_INTERVAL);

		return () => clearInterval(intervalId);
	}, [lastSyncedBlock, publicClient]);

	return (
		<NetworkSyncContext.Provider value={{ isLoading, lastSyncedBlock }}>
			{children}
		</NetworkSyncContext.Provider>
	);
};
