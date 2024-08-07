import { loadCommodities } from "@/app/(main)/actions";
import { SalesOverview } from "@/app/producers/components/SalesOverview";
import { EthAddress } from "@/typings";

export default async function Page() {
	const commodities = await loadCommodities();
	return (
		<div className="">
			<h1 className="text-2xl font-bold mb-4">Home</h1>
			{commodities && commodities?.length > 0 && (
				<>
					<SalesOverview
						poolAddresses={commodities?.map(
							(item) => item.poolAddress as EthAddress,
						)}
					/>
				</>
			)}
		</div>
	);
}
