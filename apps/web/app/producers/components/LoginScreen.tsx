"use client";

import { Button } from "@/components/button";
import { useAuth } from "@/providers/AuthProvider";
import { Content } from "@carbon/react";

export function LoginScreen() {
	const { login, isAuthenticated } = useAuth();

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<h1 className="text-2xl font-bold mb-2">Welcome</h1>
			<p className="mb-10 text-center">Please log in to access the app.</p>
			<Button onClick={login} variant="black" fullWidth>
				Log In
			</Button>
		</div>
	);
}
