"use client";

import { Notification, UserAvatar } from "@carbon/icons-react";
import {
	Header,
	HeaderContainer,
	HeaderGlobalAction,
	HeaderGlobalBar,
	HeaderMenu,
	HeaderMenuButton,
	HeaderMenuItem,
	HeaderNavigation,
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
import {
	ROUTE_ADMIN_PAGE,
	ROUTE_HOME,
	ROUTE_MINT_PAGE,
	ROUTE_REGISTER_PAGE,
	getProfileRoute,
} from "@/utils/route.utils";
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
						<Link className="cds--header__name" href={ROUTE_HOME} passHref>
							Hello Future
						</Link>
						<HeaderNavigation aria-label="Hello Future Navigation">
							<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
								<Link className="h-full" href={ROUTE_REGISTER_PAGE}>
									Register
								</Link>
							</HeaderMenuItem>
							<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
								<Link className="h-full" href={ROUTE_ADMIN_PAGE}>
									Admin
								</Link>
							</HeaderMenuItem>
						</HeaderNavigation>
						<SideNav
							isPersistent={false}
							aria-label="Side navigation"
							expanded={isSideNavExpanded}
						>
							<SideNavItems>
								<HeaderSideNavItems>
									<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
										<Link href={ROUTE_REGISTER_PAGE}>Register</Link>
									</HeaderMenuItem>
									<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
										<Link href={ROUTE_ADMIN_PAGE}>Admin</Link>
									</HeaderMenuItem>
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
