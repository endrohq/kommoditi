import { Button } from "@/components/button";
import { usePublishTx } from "@/hooks/usePublishTx";
import { contracts } from "@/lib/constants";
import { CommodityToken, EthAddress } from "@/typings";
import { formatNumber } from "@/utils/number.utils";
import { Form, TextInput } from "@carbon/react";
import React from "react";
import { useReadContract } from "wagmi";

const { commodityPool, commodityExchange } = contracts;

interface LiquidityProviderProps {
	commodity: CommodityToken;
}

function AddLiquidity({ tokenAddress }: { tokenAddress?: EthAddress }) {
	const [amount, setAmount] = React.useState<number>(0);
	const [minPrice, setMinPrice] = React.useState<number>(0);
	const [maxPrice, setMaxPrice] = React.useState<number>(0);

	// function provideLiquidity(address tokenAddress, uint256 minPrice, uint256 maxPrice)
	const { writeToContract, isSuccess, isSubmitting } = usePublishTx({
		address: commodityExchange.address,
		abi: commodityExchange.abi,
		functionName: "provideLiquidity",
		eventName: "PoolCreated",
	});

	function handleAddLiquidity() {
		writeToContract([tokenAddress, minPrice, maxPrice], amount);
	}

	return (
		<div>
			<Form
				className=""
				onSubmit={(e) => {
					e.preventDefault();
					handleAddLiquidity();
				}}
			>
				<TextInput
					labelText="Amount"
					id="amount"
					placeholder="Amount"
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
					type="number"
				/>
				<div className="flex items-center !space-x-4 mt-4">
					<TextInput
						labelText="Min Price"
						id="minPrice"
						placeholder="Min Price"
						value={minPrice}
						onChange={(e) => setMinPrice(Number(e.target.value))}
						type="number"
					/>
					<TextInput
						labelText="Max Price"
						id="maxPrice"
						placeholder="Max Price"
						value={maxPrice}
						onChange={(e) => setMaxPrice(Number(e.target.value))}
						type="number"
					/>
				</div>
				<Button
					className="mt-4"
					fullWidth
					loading={isSubmitting}
					variant="default"
				>
					Add Liquidity
				</Button>
			</Form>
		</div>
	);
}

export function LiquidityProvider({ commodity }: LiquidityProviderProps) {
	console.log(commodity);
	const { data: liquidityData, error } = useReadContract({
		address: commodity.poolAddress,
		abi: commodityPool.abi,
		functionName: "getTotalLiquidity",
	});

	console.log(liquidityData);

	return (
		<div className="p-6 bg-gray-50 rounded mt-10">
			<p className="mb-6">
				Total Liquidity: {formatNumber(liquidityData as number)} HBAR
			</p>
			<AddLiquidity tokenAddress={commodity.tokenAddress} />
		</div>
	);
}
