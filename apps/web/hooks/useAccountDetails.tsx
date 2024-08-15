import { Account, EthAddress, Participant } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useBalance } from "wagmi";

interface UseAccountDetailsArgs {
	address: EthAddress;
	enabled?: boolean;
}

interface UseAccountDetailsProps {
	account?: Account;
	isLoading: boolean;
	refetch(): void;
}

export function useAccountDetails({
	address,
}: UseAccountDetailsArgs): UseAccountDetailsProps {
	const { data: balance } = useBalance({
		address,
	});

	const { data, isLoading } = useQuery({
		queryKey: [`participant-${address}`],
		queryFn: () => fetchWrapper<Participant>(`/api/participants/${address}`),
	});

	return useMemo(
		() => ({
			account: {
				id: data?.id,
				address,
				balance: balance?.value ? formatEther(balance?.value) : "0",
				locations: data?.locations || [],
				name: data?.name || "",
				type: data?.type,
				overheadPercentage: data?.overheadPercentage,
			} as Account,
			isLoading,
			refetch: () => {},
		}),
		[data, isLoading, balance],
	);
}
