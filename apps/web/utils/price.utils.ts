import { CommodityPoolLiquidity } from "@/typings";

export function processPriceDistribution(
	distributorLiquidities: CommodityPoolLiquidity[] = [],
	steps: number = 50,
) {
	if (distributorLiquidities.length === 0) return [];
	const data = distributorLiquidities || [];

	const minPrice = Math.min(...data.map((distributor) => distributor.minPrice));
	const maxPrice = Math.max(...data.map((distributor) => distributor.maxPrice));

	const range = maxPrice - minPrice;
	const stepSize = range / steps;

	const distribution = [];

	for (let i = 0; i <= steps; i++) {
		const price = minPrice + i * stepSize;
		let totalLiquidity = 0;

		for (const distributor of distributorLiquidities) {
			if (price >= distributor.minPrice && price <= distributor.maxPrice) {
				const liquidityAtPrice =
					distributor.amount / (distributor.maxPrice - distributor.minPrice);
				totalLiquidity += liquidityAtPrice;
			}
		}

		distribution.push({
			price: parseFloat(price.toFixed(2)),
			liquidity: parseFloat(totalLiquidity.toFixed(2)),
		});
	}

	return distribution;
}

export function calculateCommodityPurchaseTotalPrice(
	currentPrice: number,
	quantity: number,
	overheadPercentage?: number,
) {
	if (!currentPrice || !quantity) return;
	const basePrice = currentPrice * quantity;

	let totalPrice = basePrice;
	if (overheadPercentage !== undefined) {
		const overheadFee = (basePrice * overheadPercentage) / 10000;
		totalPrice = basePrice + overheadFee;
	}
	const buffer = totalPrice * 0.0002; // 0.01% buffer
	return totalPrice + buffer;
}
