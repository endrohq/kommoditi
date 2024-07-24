"use client";

import { CreateCommodityModal } from "@/app/admin/CreateCommodityModal";
import { Button } from "@/components/button";
import { contracts } from "@/lib/constants";
import { getShortenedFormat } from "@/utils/address.utils";
import { Content, Form, TableCell, TableRow, TextInput } from "@carbon/react";
import React, { useState } from "react";
import { useReadContract } from "wagmi";

const tokenAuthority = contracts.tokenAuthority;

interface CommodityListingProps {
	commodity: any;
}

export function CommodityListing({ commodity }: CommodityListingProps) {
	return (
		<TableRow>
			<TableCell>{commodity}</TableCell>
			<TableCell>{getShortenedFormat(commodity)}</TableCell>
			<TableCell>false</TableCell>
		</TableRow>
	);
}
