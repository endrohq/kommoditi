import { contracts } from "@/lib/constants";
import { EthAddress, Participant } from "@/typings";
import { useReadContract } from "wagmi";

interface UseParticipantArgs {
	address: EthAddress;
	enabled?: boolean;
}

export function useParticipant({ address, enabled }: UseParticipantArgs) {
	const { data } = useReadContract({
		address: contracts.participantRegistry.address,
		abi: contracts.participantRegistry.abi,
		functionName: "getParticipantByAddress",
		args: [address],
		query: {
			enabled,
		},
	});
	return data as Participant;
}
