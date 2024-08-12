"use client";

import { OnboardingModal } from "@/components/onboarding";
import { useAccountDetails } from "@/hooks/useAccountDetails";
import { Account, EthAddress, Participant } from "@/typings";
import { usePrivy } from "@privy-io/react-auth";
import React, {
	ReactNode,
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
} from "react";

import { fetchWrapper } from "@/utils/fetch.utils";
import { formatEther } from "viem";

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
	// const [participant, setParticipant] = useState<Participant>();
	const { authenticated, user, login, ready, logout } = usePrivy();
	const {
		account,
		isLoading: isLoadingAccount,
		refetch,
	} = useAccountDetails({
		address: user?.wallet?.address as EthAddress,
		enabled: ready,
	});

	/*useEffect(() => {
		async function fetchParticipant() {
			const response = await fetchWrapper<Participant>(
				`/api/participants/${user?.wallet?.address}`,
			);
			setParticipant(response);
		}
		if (ready && authenticated) {
			fetchParticipant();
		}
	}, [authenticated, ready]);*/

	const isLoading = !ready || isLoadingAccount;
	const isOnboarded = !account?.name || account?.locations.length === 0;

	const values = useMemo(
		() => ({
			account,
			isAuthenticated: authenticated,
			hasBalance: account?.balance !== "0",
			login: () => login(),
			logout: () => logout(),
			isLoading,
		}),
		[isLoading, account, authenticated],
	);

	return (
		<AuthContext.Provider value={values}>
			{children}
			{!isOnboarded && authenticated && <OnboardingModal refetch={refetch} />}
		</AuthContext.Provider>
	);
}
