"use client";

import { Notification, UserAvatar } from "@carbon/icons-react";
import {
	Header,
	HeaderContainer,
	HeaderGlobalAction,
	HeaderGlobalBar,
	HeaderMenuButton,
	HeaderMenuItem,
	HeaderName,
	HeaderSideNavItems,
	OverflowMenu,
	OverflowMenuItem,
	SideNav,
	SideNavItems,
	Theme,
} from "@carbon/react";

import { EthAvatar } from "@/components/EthAvatar";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { useAuth } from "@/providers/AuthProvider";
import { getProfileRoute } from "@/utils/route.utils";
import Link from "next/link";
import React, { useState } from "react";

interface ContainerHeaderProps {
	isSideNavExpanded: boolean;
	onClickSideNavExpand: () => void;
}

export function ContainerHeader() {
	const { isAuthenticated, account, login, logout, isLoading } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	const togglePanel = () => {
		setIsOpen(!isOpen);
	};

	return (
		<Theme theme="g100">
			<HeaderContainer
				render={({
					isSideNavExpanded,
					onClickSideNavExpand,
				}: ContainerHeaderProps) => (
					<Header className="relative" aria-label="Carbon Tutorial">
						<HeaderMenuButton
							aria-label="Open menu"
							onClick={onClickSideNavExpand}
							isActive={isSideNavExpanded}
						/>
						<Link href="/" passHref legacyBehavior>
							<HeaderName prefix="">Hello Future</HeaderName>
						</Link>
						<SideNav
							isPersistent={false}
							aria-label="Side navigation"
							expanded={isSideNavExpanded}
						>
							<SideNavItems>
								<HeaderSideNavItems>
									<Link href="/" passHref legacyBehavior>
										<HeaderMenuItem>Home</HeaderMenuItem>
									</Link>
								</HeaderSideNavItems>
							</SideNavItems>
						</SideNav>
						<HeaderGlobalBar>
							<HeaderGlobalAction
								aria-label="Notifications"
								tooltipAlignment="center"
								className="action-icons"
							>
								<Notification size={20} />
							</HeaderGlobalAction>

							<HeaderGlobalAction
								onClick={!isAuthenticated ? login : togglePanel}
								className="action-icons relative"
								aria-label=""
							>
								<OverflowMenu
									open={isOpen}
									as="div"
									flipped
									style={{ background: "transparent" }}
									onClose={() => setIsOpen(false)}
									renderIcon={() =>
										isLoading ? (
											<LoadingOutlined className="text-white" />
										) : !isAuthenticated ? (
											<UserAvatar size={20} />
										) : (
											!!account?.address && (
												<EthAvatar address={account?.address} size={20} />
											)
										)
									}
								>
									<Link
										className="w-full"
										href={getProfileRoute(account?.address)}
									>
										<OverflowMenuItem itemText="Profile" />
									</Link>
									<OverflowMenuItem
										onClick={logout}
										itemText="Logout"
										hasDivider
									/>
								</OverflowMenu>
							</HeaderGlobalAction>
						</HeaderGlobalBar>
					</Header>
				)}
			/>
		</Theme>
	);
}
