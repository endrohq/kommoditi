import { chainOptions, contracts } from "@/lib/constants";
import {
	CommodityToken,
	EthAddress,
	Participant,
	PoolTransaction,
	poolTransactionTypes,
} from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { formatNumber } from "@/utils/number.utils";
import {
	parseSmCommodityPoolEvent,
	smParticipantTypeToParticipantType,
} from "@/utils/parser.utils";
import { getPublicClient } from "@wagmi/core";

import { formatEther } from "viem";

export async function syncCommodity(
	events: { tokenAddress: string; poolAddress: string }[],
) {
	let tokens: CommodityToken[] = [];
	for (const { tokenAddress, poolAddress } of events) {
		const token = await fetchWrapper<{ name: string; symbol: string }>(
			`/api/tokens/${tokenAddress}`,
		);
		tokens.push({
			tokenAddress,
			poolAddress,
			name: token.name,
			symbol: token.symbol,
		} as CommodityToken);
	}

	if (tokens.length > 0) {
		await fetchWrapper("/api/commodities", {
			method: "POST",
			body: JSON.stringify(tokens),
		});
	}

	return tokens;
}

export async function getCommoditiesFromClient(
	fromBlock: bigint,
	toBlock: bigint,
) {
	try {
		const client = getPublicClient(chainOptions);
		const events = await client.getLogs({
			address: contracts.commodityExchange.address,
			events: contracts.commodityExchange.abi.filter(
				// @ts-ignore
				(event) => event.name === "CommodityTokenCreated",
			),
			fromBlock: fromBlock - BigInt(500),
			toBlock,
		});

		const input = events.map(({ args }) => ({
			tokenAddress: (args as any).tokenAddress,
			poolAddress: (args as any).poolAddress,
		}));

		return await syncCommodity(input);
	} catch (error) {
		console.error("Error fetching stored commodities:", error);
	}
	return [];
}

export async function getPoolTransactions(
	fromBlock: bigint,
	toBlock: bigint,
	commodities: CommodityToken[],
) {
	try {
		const poolAddresses = commodities
			.map((c) => c.poolAddress)
			.filter((a) => !!a);

		const client = getPublicClient(chainOptions);
		const events = await client.getLogs({
			address: poolAddresses,
			events: contracts.commodityPool.abi.filter((event) =>
				// @ts-ignore
				poolTransactionTypes.includes(event.name ?? ""),
			),
			fromBlock,
			toBlock,
		});

		// Group events by transaction hash
		const eventsByTx = events.reduce(
			(acc, event) => {
				if (!acc[event.transactionHash]) {
					acc[event.transactionHash] = [];
				}
				acc[event.transactionHash].push(event);
				return acc;
			},
			{} as Record<EthAddress, typeof events>,
		);

		const transactions = await Promise.all(
			Object.entries(eventsByTx).map(async ([hash, txEvents]) => {
				const block = await client.getBlock({
					blockNumber: txEvents[0].blockNumber,
				});

				const fullTx = await client.getTransaction({
					hash: hash as EthAddress,
				});

				console.log({
					fullTx,
					txEvents,
					commodities,
				});

				return {
					id: hash,
					from: fullTx.from,
					to: fullTx.to,
					value: formatNumber(formatEther(fullTx.value)),
					blockNumber: Number(txEvents[0].blockNumber),
					createdAt: block ? new Date(Number(block.timestamp) * 1000) : 0,
					events: txEvents.map((event) =>
						parseSmCommodityPoolEvent(
							event,
							commodities?.find(
								(c) =>
									c.poolAddress?.toLowerCase() === event.address?.toLowerCase(),
							),
						),
					),
				} as PoolTransaction;
			}),
		);

		if (transactions.length > 0) {
			await fetchWrapper("/api/transactions", {
				method: "POST",
				body: JSON.stringify(transactions),
			});
		}
	} catch (error) {
		console.error("Error fetching stored transactions:", error);
	}
}

export async function getParticipants(fromBlock: bigint, toBlock: bigint) {
	const client = getPublicClient(chainOptions);
	const events = await client.getLogs({
		address: contracts.participantRegistry.address,
		events: contracts.participantRegistry.abi?.filter(
			// @ts-ignore
			(event) => event.name === "ParticipantRegistered",
		),
		fromBlock,
	});

	const dataWithNull: (Participant | null)[] = await Promise.all(
		events.map(async (log) => {
			const {
				name,
				participant,
				participantType,
				locations,
				overheadPercentage,
			} = log.args as Record<string, any>;

			console.log(log.args);

			const type = smParticipantTypeToParticipantType(participantType);

			return {
				id: participant,
				name,
				overheadPercentage: Number(overheadPercentage),
				type,
				locations: locations?.map((l: Record<string, any>) => ({
					id: l.id,
					name: l.name,
					centerLat: Number(l.centerLat),
					centerLng: Number(l.centerLng),
					locationType: l.locationType,
				})),
			} as Participant;
		}),
	);
	const participants = dataWithNull.filter((p) => p !== null) as Participant[];

	if (participants.length > 0) {
		await fetchWrapper("/api/participants", {
			method: "POST",
			body: JSON.stringify(participants),
		});
	}
}
