"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import React from "react";
import { Button, ButtonProps } from "./index";

type NavigationButtonProps = ButtonProps & {
	children: React.ReactNode;
	href?: string;
	onClick?: () => void;
};

export function ButtonWithAuthentication({
	children,
	href,
	onClick,
	...props
}: NavigationButtonProps) {
	const { isAuthenticated, login } = useAuth();
	if (isAuthenticated) {
		const Component = href ? Link : "div";
		return (
			<Component href={href || ""} onClick={onClick}>
				<Button {...props}>{children}</Button>
			</Component>
		);
	}

	return (
		<Button onClick={login} {...props}>
			{children}
		</Button>
	);
}
