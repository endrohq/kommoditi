"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { useAuth } from "@/providers/AuthProvider";
import { EthAddress } from "@/typings";
import { Content } from "@carbon/react";

interface ProfilePageProps {
	params: {
		address: string;
	};
}

export default function ProfilePage({ params }: ProfilePageProps) {
	const { account, isLoading } = useAccountDetails({
		address: params?.address as EthAddress,
	});

	return (
		<Content>
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<>
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
								<span className="font-bold text-black">
									{JSON.stringify(account?.producer)}
								</span>
							</p>
						</div>
					</main>
				</>
			)}
		</Content>
	);
}
