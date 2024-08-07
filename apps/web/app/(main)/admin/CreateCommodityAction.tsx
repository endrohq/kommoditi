"use client";

import { CreateCommodityModal } from "@/app/(main)/admin/CreateCommodityModal";
import { Button } from "@/components/button";

import React, { useState } from "react";

export function CreateCommodityAction() {
	const [showModal, setShowModal] = useState(false);
	return (
		<>
			<Button onClick={() => setShowModal(true)}>Create Commodity</Button>
			{showModal && (
				<CreateCommodityModal
					onSuccess={() => {
						setShowModal(false);
					}}
					onCancel={() => setShowModal(false)}
				/>
			)}
		</>
	);
}
