"use client";

import { MobileModal } from "@/components/modal/MobileModal";

interface SaleItemModalProps {
	listing: any;
	handleClose(): void;
}

export function SaleItemModal({ listing, handleClose }: SaleItemModalProps) {
	return (
		<MobileModal
			bodyClassName="relative"
			showClose={false}
			position="bottom"
			open
			close={handleClose}
		>
			sdfs
			{/*<MapToDisplay regions={participant.locations} mapHeight={125} />
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
						{participant?.name || getShortenedFormat(listing.args.producer)}
					</div>
				</div>
				<div>
					<div>Location</div>
					<div className="font-semibold text-black w-9/12">
						{participant.locations[0].name}
					</div>
				</div>
			</div>*/}
		</MobileModal>
	);
}
