"use client";

import { PoolStatistics } from "@/app/(main)/tokens/[address]/PoolStatistics";
import { TransactionList } from "@/app/(main)/tokens/[address]/PoolTransactions";
import { TokenPageHeader } from "@/app/(main)/tokens/[address]/components/TokenPageHeader";
import {
	LoadingTokenPage,
	TokenNotFoundPage,
} from "@/app/(main)/tokens/[address]/components/placeholders";
import { CommodityListings } from "@/app/(main)/tokens/[address]/listings";
import { Button } from "@/components/button";
import { PlusOutlined } from "@/components/icons/PlusOutlined";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { getTokenPage } from "@/utils/route.utils";
import { Content } from "@carbon/react";
import Link from "next/link";
import React from "react";

interface Props {
	params: {
		address: string;
	};
}

export default function Page({ params }: Props) {
	const { isLoading, commodity } = useTokenPage();
	if (isLoading) {
		return <LoadingTokenPage />;
	}
	if (!commodity || !commodity?.poolAddress) {
		return <TokenNotFoundPage />;
	}

	return (
		<Content className="px-72 flex items-start space-x-10">
			<div className="w-10/12 mx-auto">
				<TokenPageHeader />
				<PoolStatistics />
				<div className="gap-10 flex flex-col mt-10"></div>
			</div>
			<div className="w-2/12">
				<Link href={`${getTokenPage(params.address)}/liquidity`}>
					<Button icon={<PlusOutlined />}>Add Liquidity</Button>
				</Link>
			</div>
		</Content>
	);
}
