"use client";

import { useTokenPage } from "@/providers/TokenPageProvider";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function Statistic({ value, label }: { label: string; value: string }) {
	return (
		<div
			style={{ borderRight: "1px solid #ddd" }}
			className="text-right mr-2 !pr-4 last:mr-0 last:!pr-0 last:!border-0"
		>
			<div className="font-semibold text-base text-gray-950">{value}</div>
			<div className="text-xs text-gray-600">{label}</div>
		</div>
	);
}

export function TokenStatistics() {
	const { commodity, countries } = useTokenPage();

	const { data } = useQuery({
		queryKey: [`statistics-${commodity?.tokenAddress}`],
		queryFn: () =>
			fetchWrapper<{ producers: number; distributors: number }>(
				`/api/tokens/${commodity?.tokenAddress}/statistics`,
			),
	});

	const producersLabel =
		data?.producers && data?.producers > 1 ? "farmers" : "farmer";
	const distributorsLabel =
		data?.distributors && data?.distributors > 1
			? "distributors"
			: "distributor";
	const countriesLabel =
		countries?.length && countries?.length > 1 ? "countries" : "country";

	return (
		<div className="flex items-center justify-end">
			<Statistic
				label={`The producers of ${commodity?.name}`}
				value={`${data?.producers || 0} ${producersLabel}`}
			/>
			<Statistic
				label={`A bridge from farmers to consumer`}
				value={`${data?.distributors || 0} ${distributorsLabel}`}
			/>
			<Statistic
				label="Countries the commodity is traded at"
				value={`${countries?.length || 0} ${countriesLabel}`}
			/>
		</div>
	);
}
