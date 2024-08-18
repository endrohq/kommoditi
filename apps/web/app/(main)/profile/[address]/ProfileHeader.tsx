"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { Participant } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { Tag } from "@carbon/react";
import React from "react";

export function ProfileHeader({ account }: { account?: Participant }) {
	return (
		<>
			<div className="flex flex-col lg:justify-between lg:flex-row items-center lg:space-x-8">
				<div>
					<EthAvatar address={account?.id || ""} size={70} />
				</div>
				<div className=" w-full space-y-6 lg:space-y-0 flex lg:horizontal justify-between">
					<div>
						<h2 className="font-bold text-2xl">
							{account?.name || getShortenedFormat(account?.id)}
						</h2>
						<div className="text-[11px] lg:text-sm text-gray-700">
							{account?.id}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-6">
				<div className="text-xs mb-1 text-gray-800">Type</div>
				<Tag
					type={
						account?.type === "CONSUMER"
							? "teal"
							: account?.type === "DISTRIBUTOR"
								? "purple"
								: "blue"
					}
					className="capitalize text-[12px] font-medium ml-2"
				>
					{account?.type?.toLowerCase()}
				</Tag>
			</div>
		</>
	);
}
