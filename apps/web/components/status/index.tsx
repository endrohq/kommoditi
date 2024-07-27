import { CheckmarkFilled, WarningFilled } from "@carbon/icons-react";

import React from "react";

interface TradingStatusProps {
	isActivated: boolean;
}

export function TradingStatus({ isActivated }: TradingStatusProps) {
	return (
		<div className="space-x-1 flex items-center">
			{isActivated ? (
				<>
					<CheckmarkFilled className="text-green-700" />
					<span className="text-sm font-medium text-green-700">Tradable</span>
				</>
			) : (
				<>
					<WarningFilled className="text-red-700" />
					<span className="text-sm font-medium text-red-700">Disabled</span>
				</>
			)}
		</div>
	);
}
