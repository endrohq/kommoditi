"use client";

import { ArrowRightOutlined } from "@/components/icons/ArrowRightOutlined";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { AutoGrowTextarea } from "@/components/input/AutoGrowTextArea";
import { useOnEnterPress } from "@/hooks/useOnEnterPress";
import clsx from "clsx";
import React, { useState } from "react";

interface ChatInputProps {
	isLoadingResponse?: boolean;
	chat(message: string): void;
}

export function ChatInput({ isLoadingResponse, chat }: ChatInputProps) {
	const [userInput, setUserInput] = useState<string>(
		"I'd like to buy 40kg of columbian coffee",
	);
	const onEnterPress = useOnEnterPress(handleSubmit);

	async function handleSubmit() {
		chat(userInput);
	}

	const canSend = userInput.length > 2 && !isLoadingResponse;

	return (
		<div className="bg-gray-100 rounded p-4 flex w-full items-start gap-x-2 ">
			<AutoGrowTextarea
				className="bg-gray-100"
				onKeyDown={onEnterPress}
				value={userInput}
				placeholder="Send a message"
				disabled={isLoadingResponse}
				onChange={setUserInput}
			/>

			<div
				className={clsx(
					"bg-transition px-1.5 pb-1 rounded",
					canSend || isLoadingResponse
						? "bg-black cursor-pointer hover:contrast-200"
						: "bg-gray-200",
				)}
			>
				{isLoadingResponse ? (
					<LoadingOutlined className="text-white" />
				) : (
					<ArrowRightOutlined
						onClick={() => canSend && handleSubmit()}
						className={clsx(
							"leading-none text-base text-gray-400",
							canSend ? "text-white cursor-pointer " : "text-gray-400",
						)}
					/>
				)}
			</div>
		</div>
	);
}
