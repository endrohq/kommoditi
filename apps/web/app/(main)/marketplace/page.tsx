"use client";

import { ChatInput } from "@/components/input/ChatInput";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useState } from "react";

export default function Page() {
	const [isLoading, setIsLoading] = useState(false);
	const [value, setValue] = useState("");

	async function handleChat(message: string) {
		try {
			setIsLoading(true);
			const response = await fetchWrapper<any>(
				`/api/intelligence?message=${message}`,
			);
			setValue(response);
		} catch (error) {
			console.error("Error fetching response:", error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="layout my-8 sm:my-14 mx-auto">
			<div>
				<ChatInput chat={handleChat} isLoadingResponse={isLoading} />
			</div>
			{value && JSON.stringify(value)}
		</div>
	);
}
