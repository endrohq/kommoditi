import { chainOptions, contracts } from "@/lib/constants";
import {
	CommodityToken,
	EthAddress,
	GetAllPoolsResponse,
	GetCommodityResponse,
	Participant,
	PoolTransaction,
	poolTransactionTypes,
} from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { formatNumber } from "@/utils/number.utils";
import {
	parseCommodities,
	parseSmCommodityPoolEvent,
	smParticipantTypeToParticipantType,
} from "@/utils/parser.utils";
import { getPublicClient, readContract, readContracts } from "@wagmi/core";

import { formatEther } from "viem";

export async function getCommoditiesFromClient(chainId: number) {
	try {
		const [{ result: commoditiesData }, { result: poolData }] =
			await readContracts(chainOptions, {
				contracts: [
					{
						address: contracts.tokenAuthority.address,
						abi: contracts.tokenAuthority.abi,
						functionName: "getCommodities",
					},
					{
						address: contracts.commodityFactory.address,
						abi: contracts.commodityFactory.abi,
						functionName: "getAllPools",
					},
				],
			});
		const tokens = commoditiesData as GetCommodityResponse[];
		const pools = poolData as GetAllPoolsResponse[];
		const parsedCommodities = parseCommodities(tokens, pools, chainId);
		await fetchWrapper<any>("/api/commodities", {
			method: "POST",
			body: JSON.stringify(parsedCommodities),
		});
		return parsedCommodities;
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

		await fetchWrapper("/api/transactions", {
			method: "POST",
			body: JSON.stringify(transactions),
		});
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
		fromBlock: BigInt(0),
	});

	const dataWithNull: (Participant | null)[] = await Promise.all(
		events.map(async (log) => {
			const { name, participantAddress, participantType } = log.args as Record<
				string,
				any
			>;

			const type = smParticipantTypeToParticipantType(participantType);

			const result = await readContract(chainOptions, {
				address: contracts.participantRegistry.address,
				abi: contracts.participantRegistry.abi,
				functionName: "getParticipantByAddress",
				args: [participantAddress],
			});

			if (!result) return null;
			const participant = result as Participant;

			return {
				id: participantAddress,
				name,
				overheadPercentage: Number(participant.overheadPercentage),
				type,
				locations: participant.locations,
			} as Participant;
		}),
	);
	const participants = dataWithNull.filter((p) => p !== null) as Participant[];
	await fetchWrapper<any>("/api/participants", {
		method: "POST",
		body: JSON.stringify(participants),
	});
}
