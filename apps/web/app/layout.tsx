import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.scss";
import { Container } from "@/components/container";
import { appTitle } from "@/lib/constants";
import { Providers } from "@/providers";
import React from "react";

const ibmPlexSans = IBM_Plex_Sans({
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		template: `%s | ${appTitle}`,
		default: "Home",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={ibmPlexSans.className}>
				<Providers>
					<Container>{children}</Container>
				</Providers>
			</body>
		</html>
	);
}
