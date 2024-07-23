"use client";

import { ButtonWithAuthentication } from "@/components/button/ButtonWithAuthentication";
import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";
import { parseEther } from "viem";
import { useSendTransaction } from "wagmi";

export function HomePageLayout() {
	const { account } = useAuth();
	const { sendTransaction } = useSendTransaction();

	return (
		<Content>
			<h1 className="text-4xl font-bold text-gray-800">Hello Future 👋</h1>
			<p className="text-lg text-gray-600">
				This is the start of an amazing dapp.
			</p>
			<div className="mt-10">
				<ButtonWithAuthentication
					onClick={() =>
						sendTransaction({
							to: account?.address,
							value: parseEther("1"),
						})
					}
				>
					Send test transaction
				</ButtonWithAuthentication>
			</div>
		</Content>
	);
}
