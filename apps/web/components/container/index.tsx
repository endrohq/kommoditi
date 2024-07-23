"use client";

import { ContainerHeader } from "@/components/Header";
import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function Container({ children }: { children: ReactNode }) {
	return (
		<>
			<ContainerHeader />
			{children}
			<Toaster
				containerClassName="text-sm"
				position="top-center"
				reverseOrder={false}
			/>
		</>
	);
}
