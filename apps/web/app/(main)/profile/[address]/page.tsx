import { getParticipant } from "@/app/(main)/actions/participants";
import { ProfileHeader } from "@/app/(main)/profile/[address]/ProfileHeader";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { baseCommodityUnit } from "@/lib/constants";
import clsx from "clsx";
import React from "react";

interface ProfilePageProps {
	params: {
		address: string;
	};
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const profile = await getParticipant(params.address);
	if (!profile) {
		return <></>;
	}

	const { account, tokens } = profile;

	return (
		<div className="relative">
			<MapToDisplay
				customZoom={6}
				regions={account?.locations || []}
				mapHeight={250}
			/>
			<div className="!z-[999] layout-xs flex flex-col -pt-2">
				<div
					style={{ marginTop: "-60px" }}
					className="bg-gray-50 w-full rounded px-10 py-10"
				>
					<ProfileHeader account={account} />
					<div className="mt-12 w-full">
						<div>
							<h1 className="text-lg font-bold mb-4 text-gray-800">Assets</h1>
						</div>
						<div>
							<div className="flex items-center text-xs text-gray-600 font-medium pb-3 px-4">
								<div className="w-6/12 ">Asset</div>
								<div className="w-4/12">Balance</div>
								<div className="ml-auto"></div>
							</div>
						</div>
						{tokens?.map(({ token, amount }, idx) => (
							<div
								key={token.tokenAddress}
								className={clsx(
									"flex items-center space-between w-full px-4 py-2",
									{
										"bg-white": idx % 2 === 0,
									},
								)}
							>
								<div className="w-6/12 text-sm font-semibold">{token.name}</div>
								<div className="w-4/12 text-sm font-medium">
									{amount} {baseCommodityUnit}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
