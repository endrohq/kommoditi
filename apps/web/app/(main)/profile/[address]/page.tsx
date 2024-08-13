"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { useAuth } from "@/providers/AuthProvider";
import { EthAddress } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { formatNumber } from "@/utils/number.utils";
import React from "react";

interface ProfilePageProps {
	params: {
		address: string;
	};
}

function ProfileHeader() {
	const { account } = useAuth();
	return (
		<div className="flex flex-col lg:justify-between lg:flex-row items-center lg:space-x-8">
			<div>
				<EthAvatar address={account?.address || ""} size={70} />
			</div>
			<div className=" w-full space-y-6 lg:space-y-0 flex lg:horizontal justify-between">
				<div>
					<h2 className="font-bold text-3xl">
						{account?.name || getShortenedFormat(account?.address)}
					</h2>
					<div className="text-[11px] lg:text-sm text-gray-500 font-medium">
						{account?.address}
					</div>
				</div>
				{account?.balance && (
					<div className="text-right">
						<div className="font-bold text-gray-800 text-base">
							{formatNumber(account?.balance)}
						</div>
						<div className="text-[11px] lg:text-sm text-gray-500">HBAR</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function ProfilePage({ params }: ProfilePageProps) {
	const { account, isLoading } = useAccountDetails({
		address: params?.address as EthAddress,
	});

	return (
		<div className="relative">
			<MapToDisplay
				initialViewState={{
					latitude: 37.7749,
					longitude: -122.4194,
					zoom: 11,
				}}
				regions={account?.locations || []}
				mapHeight={250}
			/>
			<div className="!z-[9999] flex flex-col">
				<div className="bg-white shadow rounded py-8 px-10 layout -mt-14 mb-6">
					{isLoading ? (
						<div className="flex items-center space-x-2">
							<LoadingOutlined />
							<p>Loading...</p>
						</div>
					) : !account?.type ? (
						<>
							<ProfileHeader />
							<div
								style={{ borderTop: "1px solid #efefef" }}
								className="text-sm mt-6 text-gray-600 pt-6"
							>
								No account found
							</div>
						</>
					) : (
						<>
							<ProfileHeader />
							{/*<div className="mt-10">
								<div>
									<h2 className="font-bold text-lg mb-2">
										Operating in regions
									</h2>
								</div>
								{account?.locations?.map((location, idx) => (
									<div className="flex items-center space-x-2" key={idx}>
										<h3>{location.name}</h3>
										<p>{location.h3Indexes?.length}</p>
									</div>
								))}
							</div>*/}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
