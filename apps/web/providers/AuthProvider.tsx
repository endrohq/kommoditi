"use client";

import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useContext } from "react";
import { formatEther } from "viem";
import { useBalance } from "wagmi";

type Account = {
	address: string;
	balance?: string;
};

export interface AuthContextProps {
	account?: Account;
	isAuthenticated: boolean;
	hasBalance: boolean;
	login: () => void;
	logout: () => void;
	isLoading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
	account: undefined,
	isAuthenticated: false,
	hasBalance: false,
	isLoading: true,
	login: () => {},
	logout: () => {},
});

export const useAuth = (): AuthContextProps => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within a AuthProvider");
	}
	return context;
};

type AuthProviderProps = {
	children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
	const { authenticated, user, login, ready, logout } = usePrivy();
	const { data } = useBalance({
		address: user?.wallet?.address as `0x${string}`,
		query: {
			enabled: authenticated && ready,
		},
	});

	const balance = data?.value ? formatEther(data?.value) : "0";

	return (
		<AuthContext.Provider
			value={{
				account: user?.wallet?.address
					? { address: user.wallet.address, balance }
					: undefined,
				isAuthenticated: authenticated,
				hasBalance: balance !== "0",
				login,
				logout,
				isLoading: !ready,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
