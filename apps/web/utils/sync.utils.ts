import { chainOptions, contracts } from "@/lib/constants";
import {
	CommodityToken,
	EthAddress,
	Participant,
	PoolTransaction,
	poolTransactionTypes,
} from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { denormalizeCoordinate, formatNumber } from "@/utils/number.utils";
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
		const token = await fetchWrapper<{
			name: string;
			symbol: string;
			hederaTokenId: string;
		}>(`/api/tokens/${tokenAddress}`);
		tokens.push({
			tokenAddress,
			poolAddress,
			name: token.name,
			symbol: token.symbol,
			hederaTokenId: token.hederaTokenId,
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

export async function getCommoditiesFromClient(fromBlock: bigint) {
	try {
		const client = getPublicClient(chainOptions);
		const events = await client.getLogs({
			address: contracts.commodityExchange.address,
			events: contracts.commodityExchange.abi.filter(
				// @ts-ignore
				(event) => event.name === "CommodityTokenCreated",
			),
			fromBlock: fromBlock - BigInt(500),
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

export async function getPoolTransactionsForAllCommodities(fromBlock: bigint) {
	const commodities = await fetchWrapper<CommodityToken[]>("/api/commodities");
	return getPoolTransactions(fromBlock, commodities);
}

export async function getPoolTransactions(
	fromBlock: bigint,
	commodities: CommodityToken[],
) {
	try {
		const poolAddresses = commodities
			.map((c) => c.poolAddress)
			.filter((a) => !!a);

		if (poolAddresses?.length === 0) {
			return;
		}

		const client = getPublicClient(chainOptions);
		const events = await client.getLogs({
			address: poolAddresses,
			events: contracts.commodityPool.abi.filter((event) =>
				// @ts-ignore
				poolTransactionTypes.includes(event.name ?? ""),
			),
			fromBlock,
			toBlock: "latest",
		});

		console.log(events);

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

		console.log(eventsByTx);

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

		console.log(transactions);

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

export function extractParticipant(
	name: string,
	participant: string,
	participantType: number,
	locations: any[],
	overheadPercentage: number,
): Participant {
	const type = smParticipantTypeToParticipantType(participantType);

	return {
		id: participant,
		name,
		overheadPercentage: Number(overheadPercentage),
		type,
		locations: locations?.map((l: Record<string, any>) => ({
			id: l.id,
			name: l.name,
			centerLat: denormalizeCoordinate(l.centerLat),
			centerLng: denormalizeCoordinate(l.centerLng),
			locationType: l.locationType,
		})),
	} as Participant;
}

export function saveParticipants(participants: Participant[]) {
	return fetchWrapper("/api/participants", {
		method: "POST",
		body: JSON.stringify(participants),
	});
}

export async function getParticipants(fromBlock: bigint) {
	const client = getPublicClient(chainOptions);
	const events = await client.getLogs({
		address: contracts.participantRegistry.address,
		events: contracts.participantRegistry.abi?.filter(
			// @ts-ignore
			(event) => event.name === "ParticipantRegistered",
		),
	});

	const dataWithNull: (Participant | null)[] = events.map((log) => {
		const {
			name,
			participant,
			participantType,
			locations,
			overheadPercentage,
		} = log.args as Record<string, any>;
		return extractParticipant(
			name,
			participant,
			participantType,
			locations,
			overheadPercentage,
		);
	});
	const participants = dataWithNull.filter((p) => p !== null) as Participant[];
	await saveParticipants(participants);
}
