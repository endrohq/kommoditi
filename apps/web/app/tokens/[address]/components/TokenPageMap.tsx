"use client";

import { MapToDisplay } from "@/components/input/MapToDisplay";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { Region } from "@/typings";
import { fetchWrapper } from "@/utils/fetch.utils";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

export function TokenPageMap({ tokenAddress }: { tokenAddress: string }) {
	const { countries, setCountries } = useTokenPage();
	const { data, isLoading } = useQuery({
		queryKey: [`countries/${tokenAddress}`],
		queryFn: () =>
			fetchWrapper<Region[]>(`/api/tokens/${tokenAddress}/locations`),
	});

	useEffect(() => {
		if (data && data?.length > 0 && (!countries || countries?.length === 0)) {
			setCountries(data);
		}
	}, [data, countries]);

	return (
		<div className="bg-orange-50">
			{!data || data?.length === 0 ? (
				<div className="text-center text-gray-500 p-4 h-[225px]" />
			) : (
				<MapToDisplay regions={data} mapHeight={225} />
			)}
		</div>
	);
}
