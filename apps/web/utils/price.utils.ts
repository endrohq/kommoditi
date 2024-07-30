import { CommodityPoolLiquidity } from "@/typings";

export function processPriceDistribution(
	ctfLiquidities: CommodityPoolLiquidity[] = [],
	steps: number = 50,
) {
	if (ctfLiquidities.length === 0) return [];
	const data = ctfLiquidities || [];

	const minPrice = Math.min(...data.map((ctf) => ctf.minPrice));
	const maxPrice = Math.max(...data.map((ctf) => ctf.maxPrice));

	const range = maxPrice - minPrice;
	const stepSize = range / steps;

	const distribution = [];

	for (let i = 0; i <= steps; i++) {
		const price = minPrice + i * stepSize;
		let totalLiquidity = 0;

		for (const ctf of ctfLiquidities) {
			if (price >= ctf.minPrice && price <= ctf.maxPrice) {
				const liquidityAtPrice = ctf.amount / (ctf.maxPrice - ctf.minPrice);
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
