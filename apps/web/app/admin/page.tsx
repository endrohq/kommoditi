"use client";

import { CommodityListing } from "@/app/admin/CommodityListing";
import { CreateCommodityModal } from "@/app/admin/CreateCommodityModal";
import { Button } from "@/components/button";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { contracts } from "@/lib/constants";
import {
	Content,
	Form,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
	TextInput,
} from "@carbon/react";
import React, { useState } from "react";
import { useReadContract } from "wagmi";

const tokenAuthority = contracts.tokenAuthority;

export default function Page() {
	const [showModal, setShowModal] = useState(false);

	const { data, refetch, isLoading } = useReadContract({
		address: tokenAuthority.address,
		abi: tokenAuthority.abi,
		functionName: "getCommodities",
	});

	const tokens = data as any[];

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
								<TableHeader>Token</TableHeader>
								{!isLoading && tokens?.length > 0 && (
									<>
										<TableHeader>Address</TableHeader>
										<TableHeader>Is Exchangable</TableHeader>
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
							) : tokens?.length > 0 ? (
								tokens?.map((row) => (
									<CommodityListing commodity={row} key={row} />
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
