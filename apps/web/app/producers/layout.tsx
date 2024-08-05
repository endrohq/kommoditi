"use client";

import { LoginScreen } from "@/app/producers/components/LoginScreen";
import { MobileMenuBar } from "@/app/producers/components/MobileMenuBar";
import { ArrowLeftOutlined } from "@/components/icons/ArrowLeftOutlined";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	return (
		<div className="h-screen w-full ">
			<div className="bg-black py-3 px-6 flex items-center space-x-2 w-full">
				<ArrowLeftOutlined className="text-white text-sm" />
				<Link className="text-white text-xs font-medium" href="/">
					Back to overview
				</Link>
			</div>
			<div className="flex items-center justify-center h-[calc(100%-40px)] bg-gray-300">
				<div className="w-full max-w-md relative h-[720px] bg-white rounded-xl shadow overflow-hidden flex flex-col">
					<main className="flex-grow overflow-auto p-8">
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
		</div>
	);
}
