import { Warning } from "@carbon/icons-react";
import { Chain } from "viem";

interface NetworkOfflineProps {
	activeChain?: Chain;
}

export function NetworkOffline({ activeChain }: NetworkOfflineProps) {
	return (
		<div className="flex items-center space-x-6 py-3 bg-red-100  px-4">
			<div className="flex items-center space-x-2">
				<Warning className="text-red-700" size={20} />
				<h1 className="text-sm font-medium text-red-700">Network Offline</h1>
			</div>
			<p className="text-sm text-gray-700">
				Please check your connectivity with{" "}
				<span className="font-medium text-gray-800">{activeChain?.name}</span>{" "}
				(ID:{" "}
				<span className="font-medium text-gray-800">{activeChain?.id}</span>)
				and try again.
			</p>
		</div>
	);
}
