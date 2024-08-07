"use client";

import { CloseOutlined } from "@/components/icons/CloseOutlined";
import { MapToDisplay } from "@/components/input/MapToDisplay";
import { MobileModal } from "@/components/modal/MobileModal";
import { useParticipant } from "@/hooks/useParticipant";
import { contracts } from "@/lib/constants";
import { CommodityListing, EthAddress, PoolTransaction } from "@/typings";
import { getShortenedFormat } from "@/utils/address.utils";
import { getDistanceForDate } from "@/utils/date.utils";
import { parseListings } from "@/utils/parser.utils";
import { useState } from "react";
import { useReadContracts } from "wagmi";

interface SaleItemModalProps {
	tx: PoolTransaction;
	handleClose(): void;
}

export function SaleItemModal({ tx, handleClose }: SaleItemModalProps) {
	const participant = useParticipant({
		address: tx?.args.producer,
		enabled: true,
	});

	return (
		<MobileModal
			bodyClassName="relative"
			showClose={false}
			position="bottom"
			open
			close={handleClose}
		>
			<MapToDisplay regions={participant.locations} mapHeight={125} />
			<div className="absolute right-4 top-4">
				<div
					onClick={handleClose}
					className="bg-white w-8 aspect-square place-content-center flex flex-col items-center rounded-full"
				>
					<CloseOutlined />
				</div>
			</div>
			<div className="p-6 space-y-4 text-sm flex flex-col">
				<div className="">
					<div>Producer</div>
					<div className="font-semibold text-black">
						{participant?.name || getShortenedFormat(tx.args.producer)}
					</div>
				</div>
				<div>
					<div>Location</div>
					<div className="font-semibold text-black w-9/12">
						{participant.locations[0].name}
					</div>
				</div>
			</div>
		</MobileModal>
	);
}
