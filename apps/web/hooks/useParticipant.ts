import { contracts } from "@/lib/constants";
import { EthAddress, Participant } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";

interface UseParticipantArgs {
	address: EthAddress;
	enabled?: boolean;
}

export function useParticipant({ address, enabled }: UseParticipantArgs) {
	const { data } = useQuery({
		queryKey: ["participant", address],
		queryFn: () => fetchWrapper<Participant>(address),
		enabled,
	});
	return da;
}
