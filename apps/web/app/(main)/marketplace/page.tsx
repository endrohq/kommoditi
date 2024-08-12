import { fetchCommoditiesForSale } from "@/app/(main)/actions";
import { ItemForPurchase } from "@/app/(main)/marketplace/ItemForPurchase";

export default async function Page() {
	const data = await fetchCommoditiesForSale(
		"0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
	);

	return (
		<div className="layout my-8 sm:my-14 mx-auto">
			<div className="grid grid-cols-3 gap-6">
				{data?.map((item) => (
					<ItemForPurchase item={item} />
				))}
			</div>
		</div>
	);
}
