import { useParticipant } from "@/hooks/useParticipant";
import { Account, EthAddress } from "@/typings";
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
}

export function useAccountDetails({
	address,
	enabled,
}: UseAccountDetailsArgs): UseAccountDetailsProps {
	const { data: balance } = useBalance({
		address,
	});

	const participant = useParticipant({ address, enabled });

	const account = useMemo(() => {
		return {
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
			isLoading: false,
			refetch: () => {},
		}),
		[account],
	);
}
