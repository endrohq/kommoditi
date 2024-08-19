import CreateListingModal from "@/app/tokens/[address]/listings/CreateListingModal";
import { Button } from "@/components/button";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { PlusOutlined } from "@/components/icons/PlusOutlined";
import { contracts } from "@/lib/constants";
import { useTokenPage } from "@/providers/TokenPageProvider";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { parseListings } from "@/utils/parser.utils";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "@carbon/react";
import React from "react";
import { useReadContract } from "wagmi";

export function CommodityListings() {
	const [createModalOpen, setCreateModalOpen] = React.useState(false);
	const { commodity } = useTokenPage();
	const { data: listingsData, isLoading } = useReadContract({
		address: commodity?.poolAddress,
		abi: contracts.commodityPool.abi,
		functionName: "getOffers",
	});

	const listings = parseListings(listingsData as Record<string, any>[]);

	return (
		<div>
			<div className="flex justify-between mb-2">
				<h2 className="font-bold text-base ">Listings</h2>
				<Button
					onClick={() => setCreateModalOpen(true)}
					icon={<PlusOutlined />}
					variant="link"
				>
					Add Listings
				</Button>
			</div>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Producer</TableCell>
							{!isLoading && listings?.length > 0 && (
								<>
									<TableHeader>Time</TableHeader>
									<TableHeader>Serial Number</TableHeader>
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
						) : listings?.length > 0 ? (
							listings?.map((listing) => (
								<TableRow>
									<TableCell>{getShortenedFormat(listing.producer)}</TableCell>

									<TableCell>
										{getDistanceForDate(listing?.dateOffered)}
									</TableCell>
									<TableCell>#{listing.serialNumbers?.join(",")}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell>No listings found</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{createModalOpen && (
				<CreateListingModal handleClose={() => setCreateModalOpen(false)} />
			)}
		</div>
	);
}
