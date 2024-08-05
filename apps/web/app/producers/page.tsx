"use client";

import { SalesOverview } from "@/app/producers/components/SalesOverview";
import { useAuth } from "@/providers/AuthProvider";
import { useCommodities } from "@/providers/CommoditiesProvider";
import { EthAddress } from "@/typings";

export default function Page() {
	const { account, isLoading } = useAuth();
	const { commodities, isLoading: isLoadingCommodities } = useCommodities();

	return (
		<div className="">
			<h1 className="text-2xl font-bold mb-4">Home</h1>
			{!isLoading && !isLoadingCommodities && account?.address && (
				<>
					<SalesOverview
						poolAddresses={commodities?.map(
							(item) => item.poolAddress as EthAddress,
						)}
						address={account?.address}
					/>
				</>
			)}
		</div>
	);
}
