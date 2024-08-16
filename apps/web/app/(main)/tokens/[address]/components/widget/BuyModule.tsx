"use client";

import { ButtonWithAuthentication } from "@/components/button/ButtonWithAuthentication";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { PlaneOutlined } from "@/components/icons/PlaneOutlined";
import { NumericInput } from "@/components/input/NumericInput";

import { baseCommodityUnit, contracts } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { BuyModuleArgs, Region, TradeRoute } from "@/typings";
import { getCountryNameFromAddress } from "@/utils/commodity.utils";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { usePublishTx } from "@/hooks/usePublishTx";
import { nFormatter } from "@/utils/number.utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

interface BuyModuleProps {
	countries?: Region[];
}

export function BuyModule({ countries }: BuyModuleProps) {
	const params = useSearchParams();
	const { isAuthenticated, account } = useAuth();
	const { commodity, currentPrice } = useTokenPage();
	const { writeToContract, isSubmitting, isSuccessFullPurchase } = usePublishTx(
		{
			address: contracts.commodityExchange.address,
			abi: contracts.commodityExchange.abi,
			functionName: "consumerBuyFromDistributor",
			eventName: "CommodityPurchased",
		},
	);

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

	console.log(tradeRoute);

	const activeTradeRoutePartner = useMemo(() => {
		return tradeRoute?.options?.[0];
	}, [tradeRoute]);

	useEffect(() => {
		if (isSuccessFullPurchase) {
			toast.success("Commodity purchased successfully");
		}
	}, [isSuccessFullPurchase]);

	useEffect(() => {
		if (form?.country?.id) {
			refetch();
		}
	}, [form?.country]);

	const hasNoAmount = !form?.quantity || form?.quantity === 0;

	const countryOfUser = getCountryNameFromAddress(
		account?.locations?.[0]?.name || "",
	);

	function calculateTotalPrice() {
		if (
			!currentPrice ||
			!form?.quantity ||
			!activeTradeRoutePartner?.partner?.overheadPercentage
		)
			return;
		const basePrice = currentPrice * form?.quantity;
		const overheadFee =
			(basePrice * activeTradeRoutePartner?.partner?.overheadPercentage) /
			10000;
		const totalPrice = basePrice + overheadFee;
		const buffer = totalPrice * 0.0001; // 0.01% buffer
		return totalPrice + buffer;
	}

	async function handlePurchase() {
		try {
			const totalPrice = calculateTotalPrice();
			writeToContract(
				[
					commodity?.tokenAddress,
					activeTradeRoutePartner?.partner?.id,
					form?.quantity,
				],
				totalPrice?.toString(),
			);
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	}

	function getButtonLabel() {
		if (!isAuthenticated) {
			return "Connect Wallet";
		} else if (!form?.country) {
			return "Select Origin";
		} else if (hasNoAmount) {
			return "Enter an amount";
		} else {
			return `Purchase for ~${nFormatter(calculateTotalPrice() || 0)} HBAR`;
		}
	}

	function isButtonDisabled() {
		return (
			!form?.country ||
			hasNoAmount ||
			isSubmitting ||
			!activeTradeRoutePartner?.partner?.id
		);
	}

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
					<div className="">
						<div
							className="ml-4 h-2 w-[1px]"
							style={{ borderRight: "1px dashed #312E81" }}
						/>

						<div className=" rounded">
							<div
								style={{ border: "1px dashed #312E81" }}
								className="p-3 bg-white rounded"
							>
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
										<div className="text-sm w-8/12">
											<span className="font-medium leading-normal text-black">
												Trade routes found
											</span>{" "}
											<span>
												between{" "}
												<span className="underline">{form?.country?.name}</span>{" "}
												and <span className="underline">{countryOfUser}</span>{" "}
												through {activeTradeRoutePartner?.partner?.name}
											</span>
										</div>
									</div>
								) : (
									<div className="flex items-center space-x-3">
										<div className="p-2 pb-2.5 pt-1.5 bg-red-50 rounded-full">
											<MinusOutlined className="text-lg leading-none text-red-700" />
										</div>
										<div className="text-sm w-8/12">
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
						loading={isSubmitting}
						variant="black"
						className="py-2"
						size="lg"
						onClick={handlePurchase}
					>
						{getButtonLabel()}
					</ButtonWithAuthentication>
				</div>
			</div>
		</>
	);
}
