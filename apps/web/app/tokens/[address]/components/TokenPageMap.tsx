"use client";

import { MapToDisplay } from "@/components/input/MapToDisplay";
import { useTokenPage } from "@/providers/TokenPageProvider";
import React from "react";

export function TokenPageMap() {
	const { countries } = useTokenPage();
	return (
		<div className="bg-orange-50">
			<MapToDisplay regions={countries} mapHeight={225} />
		</div>
	);
}
