"use client";

import {
	LoadingTokenPage,
	TokenNotFoundPage,
} from "@/app/(main)/tokens/[address]/components/placeholders";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/button";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { Content, Form, TextInput } from "@carbon/react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useReadContract } from "wagmi";

import { CurrentLpDistributions } from "@/app/(main)/tokens/[address]/liquidity/CurrentLpDistributions";
import { useCommodityPrice } from "@/hooks/useCommodityPrice";
import { useAuth } from "@/providers/AuthProvider";
import {
	parseNumberToSmFormat,
	parseSmToNumberFormat,
	roundToTwoDecimals,
} from "@/utils/number.utils";
import { getTokenPage } from "@/utils/route.utils";
import { useRouter } from "next/navigation";

export default function Page() {
	const { account } = useAuth();
	const router = useRouter();
	const { commodity, isLoading: isLoadingCommodity } = useTokenPage();
	const [amount, setAmount] = React.useState<number>(0);
	const [minPrice, setMinPrice] = React.useState<number>(0);
	const [maxPrice, setMaxPrice] = React.useState<number>(0);

	const { currentPrice, priceIsLoading } = useCommodityPrice(
		commodity?.poolAddress,
	);

	const { data: ctfLiquidityDetails, isLoading: isLoadingCtfDetails } =
		useReadContract({
			address: commodity?.poolAddress,
			abi: contracts.commodityPool.abi,
			functionName: "getCTFLiquidityDetails",
			args: [account?.address],
		});

	useEffect(() => {
		if (!ctfLiquidityDetails) return;

		const [onChainAmount, onChainMinPrice, onChainMaxPrice] =
			ctfLiquidityDetails as [bigint, bigint, bigint];
		if (onChainAmount > 0) {
			// TODO: Find a way to manage active liquidity instead of any adding LP
			// setAmount(Number(formatEther(onChainAmount)));
			setMinPrice(parseSmToNumberFormat(Number(onChainMinPrice)));
			setMaxPrice(parseSmToNumberFormat(Number(onChainMaxPrice)));
		} else if (onChainAmount === BigInt(0) && currentPrice) {
			const price = Number(currentPrice);
			setMinPrice(price * 0.5);
			setMaxPrice(price * 2);
		}
	}, [ctfLiquidityDetails, currentPrice]);

	const { writeToContract, isSuccess, isSubmitting } = usePublishTx({
		address: contracts.commodityExchange.address,
		abi: contracts.commodityExchange.abi,
		functionName: "provideLiquidity",
		eventName: "CommodityLPAdded",
	});

	useEffect(() => {
		if (isSuccess) {
			toast.success("Liquidity added successfully");
			router.push(getTokenPage(commodity.tokenAddress));
		}
	}, [isSuccess]);

	function handleAddLiquidity() {
		const parsedMinPrice = parseNumberToSmFormat(roundToTwoDecimals(minPrice));
		const parsedMaxPrice = parseNumberToSmFormat(roundToTwoDecimals(maxPrice));
		writeToContract(
			[commodity?.tokenAddress, parsedMinPrice, parsedMaxPrice],
			`${amount}`,
		);
	}

	if (isLoadingCtfDetails || isLoadingCommodity || priceIsLoading) {
		return <LoadingTokenPage />;
	}
	if (!commodity || !commodity?.poolAddress) {
		return <TokenNotFoundPage />;
	}

	return (
		<Content className="px-56 !pt-0">
			<div className="w-5/12 mx-auto">
				<Breadcrumbs
					crumbs={[
						{ label: "Commodities" },
						{
							label: commodity.name,
							href: `/tokens/${commodity.tokenAddress}`,
						},
						{
							label: "Add Liquidity",
						},
					]}
				/>
				<div className="mt-4">
					<Form
						className=""
						onSubmit={(e) => {
							e.preventDefault();
							handleAddLiquidity();
						}}
					>
						<div className="p-6 rounded bg-gray-100">
							<div className="flex justify-between mb-3">
								<h3 className="font-bold text-gray-950 ">1. Set Price Range</h3>
								<div className="flex items-center space-x-2">
									<div className="text-sm text-gray-600">Current Price</div>
									<div className="text-sm font-black text-black">
										{currentPrice ? currentPrice?.toString() : "-"} HBAR
									</div>
								</div>
							</div>
							<CurrentLpDistributions
								setMinPrice={setMinPrice}
								setMaxPrice={setMaxPrice}
								currentPrice={currentPrice}
								minPrice={minPrice}
								maxPrice={maxPrice}
							/>
							<div className="flex items-center !space-x-4 mt-4">
								<TextInput
									labelText="Min Price"
									id="minPrice"
									placeholder="Min Price"
									value={minPrice}
									onChange={(e) =>
										setMinPrice(roundToTwoDecimals(Number(e.target.value)))
									}
									type="number"
									helperText="Denominated in HBAR"
								/>
								<TextInput
									labelText="Max Price"
									id="maxPrice"
									placeholder="Max Price"
									value={maxPrice}
									onChange={(e) =>
										setMaxPrice(roundToTwoDecimals(Number(e.target.value)))
									}
									type="number"
									helperText="Denominated in HBAR"
								/>
							</div>
						</div>

						<div className="mt-2 p-6 rounded bg-gray-100">
							<h3 className="font-bold text-gray-950 mb-3">
								2. Enter Liquidity Amount in HBAR
							</h3>
							<TextInput
								labelText="Amount"
								id="amount"
								placeholder="Amount"
								value={amount}
								onChange={(e) => setAmount(Number(e.target.value))}
								type="number"
								helperText="Enter the amount of liquidity you want to provide in HBAR"
							/>
						</div>
						<Button
							className="mt-2"
							fullWidth
							loading={isSubmitting}
							variant="black"
						>
							Enter an amount
						</Button>
					</Form>
				</div>
			</div>
		</Content>
	);
}
