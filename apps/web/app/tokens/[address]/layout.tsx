import { TokenPageProvider } from "@/providers/TokenPageProvider";
import React from "react";

interface LayoutProps {
	params: {
		address: string;
	};
	children: React.ReactNode;
}

export default function Layout({ params, children }: LayoutProps) {
	return (
		<TokenPageProvider address={params.address}>{children}</TokenPageProvider>
	);
}
