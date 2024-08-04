"use client";

import { LoginScreen } from "@/app/producers/components/LoginScreen";
import { MobileMenuBar } from "@/app/producers/components/MobileMenuBar";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useAuth } from "@/providers/AuthProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-300 p-4">
			<div className="w-full max-w-md h-[667px] bg-white rounded-xl shadow overflow-hidden flex flex-col">
				<main className="flex-grow overflow-auto">
					{isLoading ? (
						<LoadingOutlined />
					) : !isAuthenticated ? (
						<LoginScreen />
					) : (
						children
					)}
				</main>
				{isAuthenticated && <MobileMenuBar />}
			</div>
		</div>
	);
}
