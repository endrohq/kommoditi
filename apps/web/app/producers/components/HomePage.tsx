"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";

export default function Page() {
	const { account } = useAuth();

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Home</h1>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod,
				nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt
				nisl nunc euismod nunc.
			</p>
		</div>
	);
}
