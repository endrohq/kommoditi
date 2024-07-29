import { EthAddress } from "@/typings";
import { useEffect, useState } from "react";
import { Abi, parseEther } from "viem";
import { useWatchContractEvent, useWriteContract } from "wagmi";

interface useWriteTransactionArgs {
	address: EthAddress;
	abi: Abi;
	functionName: string;
	eventName: string;
}

interface useWriteTransactionReturnProps {
	writeToContract(args: unknown[], value?: string): void;
	isSubmitting: boolean;
	error: Error | null;
	isSuccess: boolean;
}

export function usePublishTx({
	address,
	abi,
	functionName,
	eventName,
}: useWriteTransactionArgs): useWriteTransactionReturnProps {
	const [isSuccess, setIsSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { writeContract, data: hash, error } = useWriteContract();

	useEffect(() => {
		if (error) {
			console.error(error);
			setIsSubmitting(false);
			setIsSuccess(false);
		}
	}, [error]);

	useWatchContractEvent({
		address,
		abi,
		eventName,
		onLogs(logs) {
			logs.forEach((log) => {
				if (log.transactionHash === hash) {
					setIsSuccess(true);
					setIsSubmitting(false);
				}
			});
		},
	});

	function writeToContract(args: unknown[], value?: string) {
		if (isSubmitting) return;
		setIsSubmitting(true);
		const valueToUse = value ? parseEther(value) : BigInt(0);
		try {
			writeContract({
				address,
				abi,
				functionName,
				args,
				value: valueToUse,
			});
		} catch (e) {
			console.error(e);
			setIsSubmitting(false);
			setIsSuccess(false);
		}
	}

	return {
		writeToContract,
		isSubmitting,
		error,
		isSuccess,
	};
}
