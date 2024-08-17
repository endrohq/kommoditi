import { getParticipant } from "@/app/(main)/actions/participants";
import { EthAvatar } from "@/components/EthAvatar";
import { CommodityAvatar } from "@/components/commodity/CommodityAvatar";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { Participant } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import React from "react";

interface ProfilePageProps {
	params: {
		address: string;
	};
}

function ProfileHeader({ account }: { account?: Participant }) {
	return (
		<div className="flex flex-col lg:justify-between lg:flex-row items-center lg:space-x-8">
			<div>
				<EthAvatar address={account?.id || ""} size={70} />
			</div>
			<div className=" w-full space-y-6 lg:space-y-0 flex lg:horizontal justify-between">
				<div>
					<h2 className="font-bold text-3xl">
						{account?.name || getShortenedFormat(account?.id)}
					</h2>
					<div className="text-[11px] lg:text-sm text-gray-500 font-medium">
						{account?.id}
					</div>
				</div>
			</div>
		</div>
	);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const profile = await getParticipant(params.address);
	if (!profile) {
		return <></>;
	}

	const { account, tokens } = profile;

	return (
		<div className="relative">
			<MapToDisplay regions={account?.locations || []} mapHeight={250} />
			<div className="!z-[999] layout flex flex-col -pt-2">
				<div
					style={{ marginTop: "-60px" }}
					className="bg-white w-full rounded px-10 pt-10"
				>
					<ProfileHeader account={account} />
					<div className="mt-6 w-full">
						<div>
							<h1 className="text-base font-semibold mb-4 text-gray-800">
								Assets
							</h1>
						</div>
						{tokens?.map(({ token, amount }) => (
							<div
								key={token.tokenAddress}
								className="flex items-center space-between gap-4"
							>
								<div>{token.name}</div>
								<div>{amount}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
