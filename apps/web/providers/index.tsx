"use client";

import AuthProvider from "@/providers/AuthProvider";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

const queryClient = new QueryClient();

export const chainOptions = [hardhat, hederaTestnet];
export const config = createConfig({
	chains: [hederaTestnet, hardhat],
	transports: {
		[hederaTestnet.id]: http(),
		[hardhat.id]: http(),
	},
});

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
				supportedChains: chainOptions,
				defaultChain: process.env.IS_LOCAL ? hardhat : hederaTestnet,
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={config}>
					<AuthProvider>{children}</AuthProvider>
				</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	);
}
