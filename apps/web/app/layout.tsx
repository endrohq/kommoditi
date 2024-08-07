import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.scss";
import { Providers } from "@/providers";

const ibmPlexSans = IBM_Plex_Sans({
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		template: "%s | Hello Future",
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
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
