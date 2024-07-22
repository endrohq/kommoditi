"use client";

import { chainOptions, optionConfig } from "@/lib/constants";
import AuthProvider from "@/providers/AuthProvider";
import NetworkManager from "@/providers/NetworkManager";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_KEY as string}
			config={{
				// Create embedded wallets for users who don't have a wallet
				embeddedWallets: {
					createOnLogin: "users-without-wallets",
				},
				loginMethods: ["wallet", "email"],
				supportedChains: optionConfig,
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={chainOptions}>
					<NetworkManager>
						<AuthProvider>{children}</AuthProvider>
					</NetworkManager>
				</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	);
}
