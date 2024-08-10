"use client";

import { useAuth } from "@/providers/AuthProvider";
import { formatNumber } from "@/utils/number.utils";

export function ProducerHeader() {
	const { account } = useAuth();
	return (
		<div className="flex justify-between">
			<h1 className="text-2xl font-bold mb-4">Balance</h1>
			<div className="text-right">
				<div className="font-bold">
					{account?.balance ? formatNumber(account?.balance) : 0}
				</div>
				<div className="text-xs text-gray-700">HBAR</div>
			</div>
		</div>
	);
}
