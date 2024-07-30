import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { Content } from "@carbon/react";
import React from "react";

export function LoadingTokenPage() {
	return (
		<Content className="px-56">
			<div className="w-full flex justify-center">
				<LoadingOutlined />
			</div>
		</Content>
	);
}

export function TokenNotFoundPage() {
	return (
		<Content className="px-56">
			<div className="w-full flex justify-center">
				<p>Commodity not found</p>
			</div>
		</Content>
	);
}
