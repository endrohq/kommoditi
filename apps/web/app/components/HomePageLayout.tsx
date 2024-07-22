"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";

export function HomePageLayout() {
	return (
		<Content>
			<main className="flex flex-col bg-white">
				<h1 className="text-4xl font-bold text-gray-800">Hello Future 👋</h1>
				<p className="text-lg text-gray-600">
					This is the start of an amazing dapp.
				</p>
			</main>
		</Content>
	);
}
