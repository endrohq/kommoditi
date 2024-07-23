"use client";

import { useAccountDetails } from "@/hooks/useAccountDetails";
import { Account, EthAddress } from "@/typings";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, createContext, useContext } from "react";

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

	const { account, isLoading } = useAccountDetails({
		address: user?.wallet?.address as EthAddress,
	});

	return (
		<AuthContext.Provider
			value={{
				account,
				isAuthenticated: authenticated,
				hasBalance: account?.balance !== "0",
				login,
				logout,
				isLoading: !ready || isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
