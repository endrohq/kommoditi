import { chainOptions } from "@/lib/constants";
import { useNetworkManager } from "@/providers/NetworkManager";
import { ContractName, EthAddress } from "@/typings";
import { getPublicClient } from "@wagmi/core";
import { useEffect, useState } from "react";
import { Abi, formatEther, parseEther, parseGwei } from "viem";
import {
	useEstimateGas,
	usePublicClient,
	useWaitForTransactionReceipt,
	useWatchContractEvent,
	useWriteContract,
} from "wagmi";

const MIN_TX_FEE_HBAR = "1"; // 1 HBAR in string format
const GAS_BUFFER_FACTOR = 1.3; // Increase buffer to 30%

interface useWriteTransactionArgs {
	address: EthAddress;
	abi: Abi;
	functionName: string;
	eventName: string;
	contractName: ContractName;
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
	eventName,
	contractName,
	confirmations = 5,
}: useWriteTransactionArgs): useWriteTransactionReturnProps {
	const { signalNewTx, signalNewToken } = useNetworkManager();
	const [transactionState, setTransactionState] =
		useState<TransactionState>("idle");
	const { writeContract, data: hash, error } = useWriteContract();

	const { isLoading: isWaitingForReceipt, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
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
		if (isConfirmed) {
			handleSuccess();
		}
	}, [isConfirmed]);

	useWatchContractEvent({
		address,
		abi,
		eventName,
		onLogs(logs) {
			logs.forEach((log) => {
				if (log.transactionHash === hash) {
					if (contractName === "tokenAuthority") {
						const args = (log as any)?.args as {
							tokenAddress: string;
							poolAddress: string;
						};
						signalNewToken(args.tokenAddress, args.poolAddress);
					} else {
						signalNewTx(contractName);
					}
					setTransactionState("confirming");
				}
			});
		},
	});

	async function handleSuccess() {
		setTransactionState("success");
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
				value: valueToUse, // Always add 1 HBAR to cover the minimum fee
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
