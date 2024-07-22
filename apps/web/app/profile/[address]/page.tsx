"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";

export default function ProfilePage() {
	const { account } = useAuth();
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
				</div>
			</main>
		</Content>
	);
}
