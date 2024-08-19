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
	login: () => void;
	logout: () => void;
	isLoading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
	account: undefined,
	isAuthenticated: false,
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
	const [isLoading, setIsLoading] = useState(false);
	const [participant, setParticipant] = useState<Participant>();
	const { authenticated, user, login, ready, logout } = usePrivy();

	async function fetchParticipant(address: EthAddress) {
		try {
			const response = await fetchWrapper<Participant>(
				`/api/participants/${address}`,
			);
			setParticipant(response);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (ready && authenticated && !isLoading) {
			setIsLoading(true);
			fetchParticipant(user?.wallet?.address as EthAddress);
		}
	}, [authenticated, ready]);

	const isOnboarded =
		!!participant?.name &&
		participant?.name?.length > 0 &&
		participant?.locations.length > 0;

	const values = useMemo(
		() => ({
			account: {
				id: participant?.id,
				address: user?.wallet?.address as EthAddress,
				locations: participant?.locations || [],
				name: participant?.name || "",
				type: participant?.type,
				overheadPercentage: participant?.overheadPercentage,
			} as Account,
			isAuthenticated: authenticated,
			login: () => login(),
			logout: () => logout(),
			isLoading: !ready || isLoading,
		}),
		[isLoading, ready, participant, authenticated, user],
	);

	return (
		<AuthContext.Provider value={values}>
			{children}
			{isOnboarded && authenticated && !isLoading && ready && (
				<OnboardingModal
					refetch={() => fetchParticipant(user?.wallet?.address as EthAddress)}
				/>
			)}
		</AuthContext.Provider>
	);
}
