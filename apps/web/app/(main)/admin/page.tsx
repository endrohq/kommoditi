"use client";

import { CommodityItem } from "@/app/(main)/admin/CommodityItem";
import { CreateCommodityModal } from "@/app/(main)/admin/CreateCommodityModal";
import { Button } from "@/components/button";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useCommodities } from "@/providers/CommoditiesProvider";
import {
	Content,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@carbon/react";
import React, { useState } from "react";

export default function Page() {
	const [showModal, setShowModal] = useState(false);

	const { isLoading, commodities, refetch } = useCommodities({});

	return (
		<>
			<Content className="lg:px-52">
				<div className="flex items-center mb-6 justify-between">
					<h1 className="font-bold  text-2xl">Commodities</h1>
					<Button onClick={() => setShowModal(true)}>Create Commodity</Button>
				</div>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader colSpan={4}>Token</TableHeader>
								{!isLoading && commodities?.length > 0 && (
									<>
										<TableHeader colSpan={4}>Token Address</TableHeader>
										<TableHeader colSpan={4}>LP Address</TableHeader>
										<TableHeader colSpan={8}></TableHeader>
									</>
								)}
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell>
										<LoadingOutlined />
									</TableCell>
								</TableRow>
							) : commodities?.length > 0 ? (
								commodities?.map((row) => (
									<CommodityItem
										isListed={false}
										commodity={row}
										key={row.token?.symbol}
										onListingChange={refetch}
									/>
								))
							) : (
								<TableRow>
									<TableCell>No commodities found</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Content>

			{showModal && (
				<CreateCommodityModal
					onSuccess={() => {
						refetch();
						setShowModal(false);
					}}
					onCancel={() => setShowModal(false)}
				/>
			)}
		</>
	);
}
