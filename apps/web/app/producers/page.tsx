import { fetchProducerTimeline } from "@/app/(main)/actions";
import { SalesOverview } from "@/app/producers/components/SalesOverview";

export default async function Page() {
	async function getProducerTimeline(address: string) {
		"use server";
		return fetchProducerTimeline(address);
	}

	return (
		<div className="">
			<div className="flex justify-between">
				<h1 className="text-2xl font-bold mb-4">Balance</h1>
				<div className="font-bold">24 HBAR</div>
			</div>
			<SalesOverview getProducerTimeline={getProducerTimeline} />
		</div>
	);
}
