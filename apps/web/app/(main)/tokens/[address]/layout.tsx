import { fetchCommodity } from "@/app/(main)/actions";
import { TokenPageProvider } from "@/providers/TokenPageProvider";
import React from "react";

interface LayoutProps {
	params: {
		address: string;
	};
	children: React.ReactNode;
}

export default async function Layout({ params, children }: LayoutProps) {
	const token = await fetchCommodity(params.address);
	return <TokenPageProvider token={token}>{children}</TokenPageProvider>;
}
