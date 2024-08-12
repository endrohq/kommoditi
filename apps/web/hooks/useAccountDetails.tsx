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
	enabled,
}: UseAccountDetailsArgs): UseAccountDetailsProps {
	const { data: balance } = useBalance({
		address,
	});

	const { data, isLoading } = useQuery({
		queryKey: [`participant-${address}`],
		queryFn: () => fetchWrapper<Participant>(`/api/participants/${address}`),
		enabled,
	});

	const participant = data as Participant;
	const account = useMemo(() => {
		return {
			id: participant?.id,
			address,
			balance: balance?.value ? formatEther(balance?.value) : "0",
			locations: participant?.locations || [],
			name: participant?.name || "",
			type: participant?.type,
			overheadPercentage: Number(participant?.overheadPercentage),
		};
	}, [participant, balance]);

	return useMemo(
		() => ({
			account,
			isLoading,
			refetch: () => {},
		}),
		[account, isLoading],
	);
}
