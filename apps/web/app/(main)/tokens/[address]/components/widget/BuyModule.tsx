"use client";

import { ButtonWithAuthentication } from "@/components/button/ButtonWithAuthentication";
import { NumericInput } from "@/components/input/NumericInput";

import { baseCommodityUnit } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { BuyModuleArgs, CommodityPurchasePrice, TradeRoute } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { ConfirmOrderForConsumer } from "@/app/(main)/tokens/[address]/components/widget/ConfirmOrderForConsumer";
import { TradeRouteDisplay } from "@/app/(main)/tokens/[address]/components/widget/TradeRouteDisplay";

import { nFormatter } from "@/utils/number.utils";
import { calculateCommodityPurchaseTotalPrice } from "@/utils/price.utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import Select from "react-select";

export function BuyModule() {
	const params = useSearchParams();
	const { isAuthenticated, account } = useAuth();
	const { commodity, currentPrice, countries } = useTokenPage();

	const [intentionToBuy, setIntentionToBuy] = React.useState(false);

	const [form, setForm] = React.useState<Partial<BuyModuleArgs>>({
		country: countries?.find((c) => c.id === params.get("country")),
	});

	const [hadCorrection, setHadCorrection] = React.useState(false);

	const {
		data: tradeRoute,
		isLoading: tradeRouteLoading,
		refetch,
	} = useQuery({
		queryKey: [`trade-routes-${form?.country?.id}`],
		queryFn: () =>
			fetchWrapper<TradeRoute>(
				`/api/intelligence/trade-routes?country=${form?.country?.id}&participantId=${account?.address}&tokenAddress=${commodity?.tokenAddress}`,
			),
		enabled: !!form?.country?.id,
	});

	const activeTradeRoutePartner = useMemo(() => {
		return tradeRoute?.options?.[0];
	}, [tradeRoute]);

	useEffect(() => {
		if (form?.country?.id) {
			refetch();
		}
	}, [form?.country]);

	const hasNoAmount = !form?.quantity || form?.quantity === 0;

	const countryOfUser =
		getCountryNameFromAddress(account?.locations?.[0]?.name || "") || "";

	function getButtonLabel(totalPrice: undefined | number) {
		if (!isAuthenticated) {
			return "Connect Wallet";
		} else if (!form?.country) {
			return "Select Origin";
		} else if (hasNoAmount) {
			return "Enter an amount";
		} else {
			return `Purchase for ~${nFormatter(totalPrice || 0)} HBAR`;
		}
	}

	function isButtonDisabled() {
		if (!isAuthenticated) return false;

		return (
			!form?.country ||
			hasNoAmount ||
			intentionToBuy ||
			!activeTradeRoutePartner?.partner?.id
		);
	}

	const commodityPriceDetails = useMemo<CommodityPurchasePrice>(() => {
		if (!currentPrice || !form?.quantity) {
			return {
				basePrice: 0,
				overheadFee: 0,
				subtotal: 0,
				serviceFee: 0,
				buffer: 0,
				totalPrice: 0,
			};
		}

		const basePrice = currentPrice * (form?.quantity || 0);
		const overheadFee = activeTradeRoutePartner?.partner?.overheadPercentage
			? (basePrice * activeTradeRoutePartner?.partner?.overheadPercentage) /
				10000
			: 0;
		const subtotal = basePrice + overheadFee;
		const serviceFee = (subtotal * 100) / 10000; // 1%
		const buffer = (subtotal * 1) / 10000; // 0.01%
		const totalPrice = subtotal + serviceFee + buffer;

		console.log("Frontend Calculation:");
		console.log("Base Price:", basePrice);
		console.log("Overhead Fee:", overheadFee);
		console.log("Subtotal:", subtotal);
		console.log("Service Fee:", serviceFee);
		console.log("Buffer:", buffer);
		console.log("Total Price:", totalPrice);

		return {
			basePrice,
			overheadFee,
			subtotal,
			serviceFee,
			buffer,
			totalPrice,
		};
	}, [
		currentPrice,
		form?.quantity,
		activeTradeRoutePartner?.partner?.overheadPercentage,
	]);

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
								country: countries?.find(
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
						options={countries?.map((country) => ({
							label: country.name,
							value: country.id,
						}))}
						className="!bg-transparent text-sm"
					/>
				</div>
				{form?.country && isAuthenticated && (
					<TradeRouteDisplay
						isLoading={tradeRouteLoading}
						countryOfUser={countryOfUser}
						activeTradeRoutePartner={activeTradeRoutePartner}
						activeCountryName={form?.country?.name}
						participantType={account?.type}
					/>
				)}
				<div className="pb-4">
					<div className="text-xs mb-2 text-gray-800">Amount</div>
					<div className="flex items-center justify-between bg-gray-200 py-2 px-4 rounded">
						<NumericInput
							onCorrection={() => setHadCorrection(true)}
							placeholder="0"
							max={
								activeTradeRoutePartner?.partner?.id
									? activeTradeRoutePartner?.quantity || 0
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
					{activeTradeRoutePartner && (
						<span
							className={clsx(
								"text-xs mt-1.5",
								hadCorrection ? "text-red-800 font-medium" : "text-gray-500",
							)}
						>
							* Available supply through{" "}
							<span className="font-medium">
								{activeTradeRoutePartner?.partner?.name}
							</span>
							: {activeTradeRoutePartner?.quantity || 0}
							{baseCommodityUnit}
						</span>
					)}
				</div>
				<div>
					<ButtonWithAuthentication
						disabled={isButtonDisabled()}
						fullWidth
						loading={intentionToBuy}
						variant="black"
						className="py-2"
						size="lg"
						onClick={() => setIntentionToBuy(true)}
					>
						{getButtonLabel(commodityPriceDetails?.totalPrice)}
					</ButtonWithAuthentication>
				</div>
			</div>
			{intentionToBuy &&
				activeTradeRoutePartner &&
				form?.quantity &&
				commodityPriceDetails && (
					<ConfirmOrderForConsumer
						activeTradeRoutePartner={activeTradeRoutePartner}
						quantity={form?.quantity}
						overheadPercentage={
							activeTradeRoutePartner?.partner?.overheadPercentage
						}
						priceDetails={commodityPriceDetails}
						onClose={() => setIntentionToBuy(false)}
						isConsumer={account?.type === "CONSUMER"}
					/>
				)}
		</>
	);
}
