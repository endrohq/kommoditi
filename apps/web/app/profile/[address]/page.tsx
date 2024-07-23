"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";
import { useReadContract } from "wagmi";

const producerRegistry = contracts.producerRegistry;

export default function ProfilePage() {
	const { account } = useAuth();
	const { data, isLoading } = useReadContract({
		address: producerRegistry.address,
		abi: producerRegistry.abi,
		functionName: "getProducer",
		args: [account?.address],
	});
	return (
		<Content>
			<main className="flex flex-col bg-white">
				<EthAvatar address={account?.address || ""} size={100} />
				<div className="mt-10">
					<p className="text-lg text-gray-600">
						Account is:{" "}
						<span className="font-bold text-black">{account?.address}</span>
					</p>
					<p className="text-lg text-gray-600">
						Balance:{" "}
						<span className="font-bold text-black">
							{account?.balance} HBAR
						</span>
					</p>
					<p className="text-lg text-gray-600">
						is Producer? :{" "}
						<span className="font-bold text-black">{JSON.stringify(data)}</span>
					</p>
				</div>
			</main>
		</Content>
	);
}
