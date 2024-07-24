"use client";

import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ContainerHeader } from "./Header";

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
