import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { CheckmarkFilled } from "@carbon/icons-react";
import React from "react";

export function TxStepItem({
	label,
	isSuccess,
	isLoading,
	isNotActiveYet,
	index,
	description,
	hasError,
}: {
	label: string;
	isLoading: boolean;
	isSuccess: boolean;
	isNotActiveYet: boolean;
	index: number;
	description?: string;
	hasError?: boolean;
}) {
	return (
		<div className="flex justify-between rounded bg-white px-4 py-2 items-center">
			<div>
				<p className="font-semibold text-sm">
					{index}. {label}
				</p>
				{description || hasError ? (
					<p className="text-xs text-gray-500 mt-0.5">
						{hasError ? "Something went wrong" : description}
					</p>
				) : (
					"-"
				)}
			</div>
			<div>
				{isNotActiveYet && (!isLoading || !isSuccess || !hasError) && (
					<MinusOutlined className="text-gray-500" />
				)}
				{isLoading && <LoadingOutlined className="text-gray-600" />}
				{isSuccess && <CheckmarkFilled className="text-green-800" />}
				{hasError && (
					<>
						<span className="underline text-blue-700">Try Again</span>
					</>
				)}
			</div>
		</div>
	);
}
