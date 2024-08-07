import { contracts } from "@/lib/constants";
import { useNetworkManager } from "@/providers/NetworkManager";
import { EthAddress, PoolTransaction, poolTransactionTypes } from "@/typings";
import { formatNumber } from "@/utils/number.utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";

const { commodityPool } = contracts;

const POLLING_INTERVAL = 10000; // 10 seconds

type Filters = {
	address?: EthAddress;
};

export function usePoolTransactions(
	poolAddresses: EthAddress[] = [],
	filters?: Filters,
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
				address: poolAddresses,
				events: commodityPool.abi.filter((event) =>
					// @ts-ignore
					poolTransactionTypes.includes(event.name ?? ""),
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

					console.log({
						log,
						block,
						fullTx,
					});
					console.log("\n\n");

					return {
						type: log.eventName ?? "unknown",
						transactionHash: log.transactionHash,
						from: fullTx.from,
						to: fullTx.to,
						value: formatNumber(formatEther(fullTx.value)),
						blockNumber: BigInt(log.blockNumber),
						dateCreated: block ? new Date(Number(block.timestamp) * 1000) : 0,
						logArgs: log.args,
					} as PoolTransaction;
				}),
			);
		},
		[publicClient, poolAddresses],
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

		if (newTransactions.length > 0) {
			const updatedTxs = [...newTransactions, ...transactionsRef.current]
				.sort((a, b) => b.dateCreated?.getTime() - a.dateCreated?.getTime())
				?.filter((tx) => {
					if (!filters?.address) return true;
					return (
						tx.from?.toLowerCase() === filters.address?.toLowerCase() ||
						tx.to?.toLowerCase() === filters.address?.toLowerCase()
					);
				});

			transactionsRef.current = updatedTxs;
			setTransactions(updatedTxs);
			latestFetchedBlockRef.current = blockNumber;
		}

		if (isLoading) {
			setIsLoading(false);
		}
	}, [fetchTransactions, publicClient, isLoading, filters]);

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
