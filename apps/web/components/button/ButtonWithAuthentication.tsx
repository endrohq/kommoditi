"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import React from "react";
import { Button, ButtonProps } from "./index";

type NavigationButtonProps = ButtonProps & {
	children: React.ReactNode;
	onClick?: () => void;
};

export function ButtonWithAuthentication({
	children,
	...props
}: NavigationButtonProps) {
	const { isAuthenticated, login } = useAuth();
	if (isAuthenticated) {
		return <Button {...props} children={children} />;
	}

	return (
		<Button onClick={() => login()} {...props}>
			{children}
		</Button>
	);
}
