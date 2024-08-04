import { contracts } from "@/lib/constants";
import { Account, EthAddress, Participant } from "@/typings";
import { formatEther } from "viem";
import { useBalance, useReadContract } from "wagmi";

interface UseAccountDetailsArgs {
	address: EthAddress;
	enabled?: boolean;
}

interface UseAccountDetailsProps {
	account?: Account;
	isLoading: boolean;
}

export function useAccountDetails({
	address,
	enabled = true,
}: UseAccountDetailsArgs): UseAccountDetailsProps {
	const canFetch = enabled && !!address;
	const { data: balance, isLoading: isLoadingBalance } = useBalance({
		address,
		query: {
			enabled: canFetch,
		},
	});
	const { data, isLoading: isLoadingProducerDetails } = useReadContract({
		address: contracts.participantRegistry.address,
		abi: contracts.participantRegistry.abi,
		functionName: "getParticipantByAddress",
		args: [address],
		query: {
			enabled: canFetch,
		},
	});

	const formattedBalance = balance?.value ? formatEther(balance?.value) : "0";
	const participant = data as Participant;

	return {
		account: {
			address,
			balance: formattedBalance,
			locations: participant?.locations || [],
			name: participant?.name || "",
			type: participant?.type,
			overheadPercentage: Number(participant?.overheadPercentage),
		},
		isLoading: isLoadingBalance || isLoadingProducerDetails,
	};
}
