"use client";

import { EthAvatar } from "@/components/EthAvatar";
import { useAuth } from "@/providers/AuthProvider";
import { getShortenedFormat } from "@/utils/address.utils";
import React from "react";

export default function Page() {
	const { account } = useAuth();
	return (
		<div className="p-8">
			<div className="flex flex-col items-center">
				<div className="border-gray-50 bg-gray-50 rounded-full">
					<EthAvatar address={account?.address || ""} size={75} />
				</div>
				<div className="mt-3 w-full space-y-6 lg:space-y-0">
					<div>
						<h2 className="font-black text-center text-xl">
							{account?.name || getShortenedFormat(account?.address)}
						</h2>
						<div className="text-[11px] text-center lg:text-xs text-gray-500 font-medium">
							{account?.balance} HBAR
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
