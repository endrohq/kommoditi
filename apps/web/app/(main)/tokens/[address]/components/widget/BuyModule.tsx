"use client";

import { ConfirmOrderForConsumer } from "@/app/(main)/tokens/[address]/components/widget/ConfirmOrderForConsumer";

import { ButtonWithAuthentication } from "@/components/button/ButtonWithAuthentication";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { PlaneOutlined } from "@/components/icons/PlaneOutlined";
import { NumericInput } from "@/components/input/NumericInput";

import { baseCommodityUnit } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { BuyModuleArgs, CommodityGroup, Region, TradeRoute } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import Select from "react-select";

interface BuyModuleProps {
	availableCountries?: Region[];
	commodityGroup: CommodityGroup[];
}

export function BuyModule({
	availableCountries,
	commodityGroup,
}: BuyModuleProps) {
	const params = useSearchParams();
	const { isAuthenticated, account } = useAuth();
	const { commodity } = useTokenPage();

	const [form, setForm] = React.useState<Partial<BuyModuleArgs>>({
		country: availableCountries?.find((c) => c.id === params.get("country")),
	});

	const [intentionToBuy, setIntentionToBuy] = React.useState(false);
	const [hadCorrection, setHadCorrection] = React.useState(false);

	const {
		data: tradeRoute,
		isLoading: tradeRouteLoading,
		refetch,
		error,
	} = useQuery({
		queryKey: [`trade-routes-${form?.country?.id}`],
		queryFn: () =>
			fetchWrapper<TradeRoute>(
				`/api/intelligence/trade-routes?country=${form?.country?.id}&consumerId=${account?.address}`,
			),
		enabled: !!form?.country?.id,
	});

	useEffect(() => {
		if (form?.country?.id) {
			refetch();
		}
	}, [form?.country]);

	const hasNoAmount = !form?.quantity || form?.quantity === 0;
	const activeCommodityByRegion = commodityGroup.find(
		(activeCommodity) => activeCommodity.country === form?.country?.id,
	);

	const activeTradeRoutePartner = tradeRoute?.ctfs?.[0];

	const countryOfUser = getCountryNameFromAddress(
		account?.locations?.[0]?.name || "",
	);

	return (
		<>
			<div className="bg-gray-100 rounded p-6 space-y-2">
				<div className="mb-1">
					<div className="text-xs mb-2 text-gray-800">Origin</div>
					<Select
						placeholder="Columbia, Congo, .."
						onChange={(option: any) =>
							setForm({
								...form,
								country: availableCountries?.find(
									(country) => country.id === option?.value,
								),
							})
						}
						value={
							form?.country && {
								label: form?.country?.name,
								value: form?.country?.id,
							}
						}
						options={availableCountries?.map((country) => ({
							label: country.name,
							value: country.id,
						}))}
						className="!bg-transparent text-sm"
					/>
				</div>
				{form?.country && isAuthenticated && (
					<div className="">
						<div
							className="ml-4 h-2 w-[1px]"
							style={{ borderRight: "1px dashed #312E81" }}
						/>

						<div className="p-[1px] bg-indigo-950 rounded">
							<div className="p-3 bg-white rounded-sm">
								{tradeRouteLoading ? (
									<div className="flex items-center space-x-2">
										<LoadingOutlined className="text-sm text-gray-500" />
										<span className="text-xs text-gray-600">
											Searching for trade routes to {countryOfUser}..
										</span>
									</div>
								) : activeTradeRoutePartner ? (
									<div className="flex items-center space-x-3">
										<div className="p-2 pb-2.5 pt-1.5 bg-orange-50 rounded-full">
											<PlaneOutlined className="text-xl leading-none text-orange-700" />
										</div>
										<div className="text-xs w-8/12">
											<span className="font-medium leading-normal text-black">
												Trade routes found
											</span>{" "}
											<span>
												between{" "}
												<span className="underline">{form?.country?.name}</span>{" "}
												and <span className="underline">{countryOfUser}</span>{" "}
												through {activeTradeRoutePartner?.name}
											</span>
										</div>
									</div>
								) : (
									<div className="flex items-center space-x-3">
										<div className="p-2 pb-2.5 pt-1.5 bg-red-50 rounded-full">
											<MinusOutlined className="text-lg leading-none text-red-700" />
										</div>
										<div className="text-xs w-8/12">
											<span className="font-medium leading-normal text-black">
												No trade routes found
											</span>{" "}
											<span>
												between{" "}
												<span className="underline">{form?.country?.name}</span>{" "}
												and <span className="underline">{countryOfUser}</span>.
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
						<div
							className="ml-4 h-2 w-[1px]"
							style={{ borderRight: "1px dashed #312E81" }}
						/>
					</div>
				)}
				<div className="pb-4">
					<div className="text-xs mb-2 text-gray-800">Amount</div>
					<div className="flex items-center justify-between bg-gray-200 py-2 px-4 rounded">
						<NumericInput
							onCorrection={() => setHadCorrection(true)}
							placeholder="0"
							max={
								activeCommodityByRegion && activeTradeRoutePartner?.id
									? activeCommodityByRegion.quantity
									: undefined
							}
							className="text-lg font-medium"
							value={form?.quantity}
							onChange={(value) => {
								setForm({ ...form, quantity: value });
								if (hadCorrection) {
									setHadCorrection(false);
								}
							}}
						/>
						<div className="text-gray-400 font-medium flex items-center space-x-1 text-sm">
							<span>{baseCommodityUnit}</span> <span>{commodity?.symbol}</span>
						</div>
					</div>
					{activeCommodityByRegion?.quantity && activeTradeRoutePartner && (
						<span
							className={clsx(
								"text-xs mt-1.5",
								hadCorrection ? "text-red-800 font-medium" : "text-gray-500",
							)}
						>
							* Available supply through{" "}
							<span className="font-medium">
								{activeTradeRoutePartner?.name}
							</span>
							: {activeCommodityByRegion?.quantity}
							{baseCommodityUnit}
						</span>
					)}
				</div>
				<div>
					<ButtonWithAuthentication
						disabled={
							!form?.country ||
							hasNoAmount ||
							intentionToBuy ||
							!activeTradeRoutePartner?.id
						}
						fullWidth
						variant="black"
						className="py-2"
						size="lg"
						onClick={() => setIntentionToBuy(true)}
					>
						{!isAuthenticated
							? "Connect Wallet"
							: !form?.country
								? "Select Origin"
								: hasNoAmount
									? "Enter an amount"
									: "Buy"}
					</ButtonWithAuthentication>
				</div>
			</div>
			{intentionToBuy && (
				<ConfirmOrderForConsumer
					quantity={form?.quantity || 0}
					ctfs={tradeRoute?.ctfs || []}
					activeCommodityByRegion={activeCommodityByRegion}
					onClose={() => setIntentionToBuy(false)}
				/>
			)}
		</>
	);
}
