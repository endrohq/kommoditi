import { contracts } from "@/lib/constants";
import { Account, EthAddress, LocationItem, Producer } from "@/typings";
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

const producerRegistry = contracts.producerRegistry;

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
		address: producerRegistry.address,
		abi: producerRegistry.abi,
		functionName: "getProducer",
		args: [address],
		query: {
			enabled: canFetch,
		},
	});

	const formattedBalance = balance?.value ? formatEther(balance?.value) : "0";

	const typedData = data as Producer;
	const producer = typedData?.location?.length > 0 ? typedData : undefined;

	return {
		account: {
			address,
			balance: formattedBalance,
			producer,
		},
		isLoading: isLoadingBalance || isLoadingProducerDetails,
	};
}
