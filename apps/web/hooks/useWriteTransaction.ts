import { EthAddress } from "@/typings";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Abi } from "viem";
import { useWatchContractEvent, useWriteContract } from "wagmi";

interface useWriteTransactionArgs {
	address: EthAddress;
	abi: Abi;
	functionName: string;
	eventName: string;
}

interface useWriteTransactionReturnProps {
	submitTransaction(args: unknown[]): void;
	isSubmitting: boolean;
	error: Error | null;
	isSuccess: boolean;
}

export function useWriteTransaction({
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

	function submitTransaction(args: unknown[]) {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			writeContract({
				address,
				abi,
				functionName,
				args,
			});
		} catch (e) {
			console.error(e);
			setIsSubmitting(false);
			setIsSuccess(false);
		}
	}

	return {
		submitTransaction,
		isSubmitting,
		error,
		isSuccess,
	};
}
