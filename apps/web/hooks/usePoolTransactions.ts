import { contracts } from "@/lib/constants";
import { useNetworkManager } from "@/providers/NetworkManager";
import { EthAddress, PoolTransaction } from "@/typings";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePublicClient } from "wagmi";

const { commodityPool } = contracts;

const POLLING_INTERVAL = 10000; // 10 seconds

export function usePoolTransactions(
	poolAddress: EthAddress,
	eventNames: string[],
) {
	const publicClient = usePublicClient();
	const { blockNumber } = useNetworkManager();
	const [transactions, setTransactions] = useState<PoolTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const latestFetchedBlockRef = useRef<bigint>(BigInt(0));
	const transactionsRef = useRef<PoolTransaction[]>([]);

	const fetchTransactions = useCallback(
		async (fromBlock: bigint, toBlock: bigint) => {
			if (!publicClient) return [];

			const events = await publicClient.getLogs({
				address: poolAddress,
				events: commodityPool.abi.filter((event) =>
					// @ts-ignore
					eventNames.includes(event.name ?? ""),
				),
				fromBlock,
				toBlock,
			});

			return Promise.all(
				events.map(async (log) => {
					const block = await publicClient.getBlock({
						blockNumber: log.blockNumber,
					});

					const fullTx = await publicClient.getTransaction({
						hash: log.transactionHash,
					});

					return {
						type: log.eventName?.toLowerCase() ?? "unknown",
						transactionHash: log.transactionHash,
						from: fullTx.from,
						to: fullTx.to,
						value: BigInt(fullTx.value),
						blockNumber: BigInt(log.blockNumber),
						dateCreated: block ? new Date(Number(block.timestamp) * 1000) : 0,
					} as PoolTransaction;
				}),
			);
		},
		[publicClient, poolAddress, eventNames],
	);

	const updateTransactions = useCallback(async () => {
		if (!blockNumber) {
			setIsLoading(false);
			return;
		}

		if (blockNumber <= latestFetchedBlockRef.current) {
			setIsLoading(false);
			return; // No new blocks to fetch
		}

		const fetchedTxs = await fetchTransactions(
			latestFetchedBlockRef.current + BigInt(1),
			blockNumber,
		);

		const existingTransactionHashes = new Set(
			transactionsRef.current.map((tx) => tx.transactionHash),
		);

		const newTransactions = fetchedTxs.filter(
			(tx) => !existingTransactionHashes.has(tx.transactionHash),
		);

		console.log({
			newTransactions,
			existingHashes: transactions.map((tx) => tx.transactionHash),
			fetchedTxs: fetchedTxs?.map((tx) => tx.transactionHash),
		});

		if (newTransactions.length > 0) {
			const updatedTxs = [...newTransactions, ...transactionsRef.current].sort(
				(a, b) => b.dateCreated?.getTime() - a.dateCreated?.getTime(),
			);

			transactionsRef.current = updatedTxs;
			setTransactions(updatedTxs);
			latestFetchedBlockRef.current = blockNumber;
		}

		if (isLoading) {
			setIsLoading(false);
		}
	}, [fetchTransactions, publicClient, isLoading]);

	useEffect(() => {
		updateTransactions();
		const intervalId = setInterval(updateTransactions, POLLING_INTERVAL);

		return () => clearInterval(intervalId);
	}, [updateTransactions]);

	return useMemo(
		() => ({
			isLoading,
			transactions,
		}),
		[transactions, isLoading],
	);
}
