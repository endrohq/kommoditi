import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { PlaneOutlined } from "@/components/icons/PlaneOutlined";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { ParticipantQuantity, ParticipantType } from "@/typings";
import clsx from "clsx";
import React from "react";

interface TradeRouteDisplayProps {
	isLoading: boolean;
	activeTradeRoutePartner?: ParticipantQuantity;
	countryOfUser: string;
	activeCountryName: string;
	participantType?: ParticipantType;
}

export function TradeRouteDisplay({
	isLoading,
	countryOfUser,
	activeTradeRoutePartner,
	activeCountryName,
	participantType,
}: TradeRouteDisplayProps) {
	const { commodity } = useTokenPage();
	function RouteFound() {
		if (participantType === ParticipantType.DISTRIBUTOR) {
			return (
				<>
					<span>Producer</span>{" "}
					<span className="font-medium leading-normal text-black">
						{activeTradeRoutePartner?.partner?.name}
					</span>{" "}
					<span>
						was found in <span className="underline">{activeCountryName}</span>{" "}
						you distribute in.
					</span>
				</>
			);
		}
		return (
			<>
				<span className="font-medium leading-normal text-black">
					Trade routes found
				</span>{" "}
				<span>
					between <span className="underline">{activeCountryName}</span> and{" "}
					<span className="underline">{countryOfUser}</span> through{" "}
					{activeTradeRoutePartner?.partner?.name}
				</span>
			</>
		);
	}

	function NoTradeRoutesFound() {
		if (participantType === ParticipantType.DISTRIBUTOR) {
			return (
				<>
					<span className="font-medium leading-normal text-black">
						No producers found
					</span>{" "}
					<span>to distribute {commodity.name} for.</span>
				</>
			);
		}

		return (
			<>
				<span className="font-medium leading-normal text-black">
					No trade routes found
				</span>{" "}
				<span>
					between <span className="underline">{activeCountryName}</span> and{" "}
					<span className="underline">{countryOfUser}</span>.
				</span>
			</>
		);
	}

	function LoadingRoute() {
		return (
			<>
				<span className="text-xs text-gray-600">
					Searching for trade routes to {countryOfUser}..
				</span>
			</>
		);
	}

	const Icon = isLoading
		? LoadingOutlined
		: activeTradeRoutePartner
			? PlaneOutlined
			: MinusOutlined;

	return (
		<div>
			<div
				className="ml-4 h-2 w-[1px]"
				style={{ borderRight: "1px dashed #312E81" }}
			/>
			<div
				style={{ border: "1px dashed #312E81" }}
				className="p-3 bg-white rounded"
			>
				<div className="flex items-center space-x-3.5">
					<div
						className={clsx(
							"w-8 aspect-square flex items-center justify-center rounded-full",
							{
								"bg-red-50": !activeTradeRoutePartner && !isLoading,
								"bg-orange-50": activeTradeRoutePartner && !isLoading,
								"bg-gray-50": isLoading && !activeTradeRoutePartner,
							},
						)}
					>
						<Icon
							className={clsx("text-base leading-none", {
								"text-orange-700": activeTradeRoutePartner && !isLoading,
								"text-red-700": !activeTradeRoutePartner && !isLoading,
								"text-gray-500": isLoading && !activeTradeRoutePartner,
							})}
						/>
					</div>
					<div className="text-[13px] leading-tight w-8/12">
						{isLoading ? (
							<LoadingRoute />
						) : activeTradeRoutePartner ? (
							<RouteFound />
						) : (
							<NoTradeRoutesFound />
						)}
					</div>
				</div>
			</div>
			<div
				className="ml-4 h-2 w-[1px]"
				style={{ borderRight: "1px dashed #312E81" }}
			/>
		</div>
	);
}
