import React, { ReactNode } from "react";

interface ContextHeaderProps {
	title: string;
	description: ReactNode;
	stepIndex: number;
}

export function ContextHeader({
	title,
	description,
	stepIndex,
}: ContextHeaderProps) {
	return (
		<div className="mb-6">
			<div className="font-medium text-gray-500 text-xs">STEP {stepIndex}</div>
			<div className=" font-bold">{title}</div>
			<p className="text-sm text-gray-500 w-7/12">{description}</p>
		</div>
	);
}
