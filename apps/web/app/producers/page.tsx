import { fetchProducerTimeline } from "@/app/(main)/actions/timeline";
import { ProducerHeader } from "@/app/producers/components/ProducerHeader";
import { SalesOverview } from "@/app/producers/components/SalesOverview";

export default async function Page() {
	async function getProducerTimeline(address: string) {
		"use server";
		return fetchProducerTimeline(address);
	}

	return (
		<div className="">
			<ProducerHeader />
			<SalesOverview getProducerTimeline={getProducerTimeline} />
		</div>
	);
}
