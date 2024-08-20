import { chainOptions, contracts } from "@/lib/constants";
import { useNetworkManager } from "@/providers/NetworkManager";
import { ContractName, EthAddress } from "@/typings";
import { getPublicClient } from "@wagmi/core";
import { useEffect, useState } from "react";
import { Abi, parseEther } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface useWriteTransactionArgs {
	address: EthAddress;
	abi: Abi;
	functionName: string;
	contractName?: ContractName;
	eventName?: string;
	confirmations?: number;
}

type TransactionState =
	| "idle"
	| "estimating"
	| "submitting"
	| "confirming"
	| "success"
	| "error";

interface useWriteTransactionReturnProps {
	writeToContract(args: unknown[], value?: string): void;
	status: TransactionState;
	error: Error | null;
	isSubmitting: boolean;
	isSuccess: boolean;
	isConfirming: boolean;
}

export function usePublishTx({
	address,
	abi,
	functionName,
	contractName,
	eventName,
	confirmations = 5,
}: useWriteTransactionArgs): useWriteTransactionReturnProps {
	const { signalNewTx, signalNewParticipant, signalTokenActivity } =
		useNetworkManager();
	const [transactionState, setTransactionState] =
		useState<TransactionState>("idle");
	const { writeContract, data: hash, error } = useWriteContract();

	const {
		isLoading: isWaitingForReceipt,
		isSuccess: isConfirmed,
		data: receipt,
	} = useWaitForTransactionReceipt({
		hash,
		confirmations,
	});

	useEffect(() => {
		if (error) {
			console.error(error);
			setTransactionState("error");
		}
	}, [error]);

	useEffect(() => {
		if (isWaitingForReceipt) {
			setTransactionState("confirming");
		}
	}, [isWaitingForReceipt]);

	useEffect(() => {
		if (isConfirmed && receipt) {
			handleConfirmedTransaction(receipt);
		}
	}, [isConfirmed, receipt]);

	async function handleConfirmedTransaction(receipt: any) {
		try {
			const client = getPublicClient(chainOptions);

			if (!contractName || !eventName) {
				setTransactionState("success");
				return;
			}

			const abiEvents = contracts?.[contractName].abi.filter(
				(event) =>
					// @ts-ignore
					event.name === eventName,
			);

			const logs = await client.getLogs({
				address,
				events: abiEvents,
				fromBlock: receipt.blockNumber,
				toBlock: receipt.blockNumber,
			});

			const relevantLog = logs.find(
				(log) => log.transactionHash === receipt.transactionHash,
			);

			if (relevantLog) {
				console.log(relevantLog);
				processLog(relevantLog);
			}

			setTransactionState("success");
		} catch (e) {
			console.error("Error processing transaction logs:", e);
			setTransactionState("error");
		}
	}

	async function processLog(log: any) {
		if (contractName === "commodityExchange") {
			const input = log?.args;
			const newTokenArgs = input as {
				tokenAddress: string;
				poolAddress: string;
			};
			await signalTokenActivity(
				newTokenArgs.tokenAddress,
				newTokenArgs.poolAddress || log.address,
			);
		} else if (contractName === "participantRegistry") {
			const {
				name,
				participant,
				participantType,
				locations,
				overheadPercentage,
			} = log.args as Record<string, any>;
			await signalNewParticipant(
				name,
				participant,
				participantType,
				locations,
				overheadPercentage,
			);
		} else if (contractName) {
			await signalNewTx(contractName);
		}
	}

	async function writeToContract(args: unknown[], value?: string) {
		if (transactionState === "submitting" || transactionState === "confirming")
			return;

		setTransactionState("estimating");

		try {
			const valueToUse = value ? parseEther(value) : undefined;

			setTransactionState("submitting");

			writeContract({
				address,
				abi,
				functionName,
				args,
				value: valueToUse,
			});
		} catch (e) {
			console.error(e);
			setTransactionState("error");
		}
	}

	return {
		writeToContract,
		status: transactionState,
		error,
		isSuccess: transactionState === "success",
		isSubmitting: transactionState === "submitting",
		isConfirming: transactionState === "confirming",
	};
}
