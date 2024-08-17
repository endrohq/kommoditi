"use client";

import { UserAvatar } from "@carbon/icons-react";
import {
	Header,
	HeaderContainer,
	HeaderGlobalAction,
	HeaderGlobalBar,
	HeaderMenuButton,
	HeaderMenuItem,
	HeaderNavigation,
	HeaderSideNavItems,
	OverflowMenu,
	OverflowMenuItem,
	SideNav,
	SideNavItems,
	Tag,
	Theme,
} from "@carbon/react";

import { EthAvatar } from "@/components/EthAvatar";
import { LoadingOutlined } from "@/components/icons/LoadingOutlined";
import { appTitle } from "@/lib/constants";
import { useAuth } from "@/providers/AuthProvider";
import {
	ROUTE_ADMIN_PAGE,
	ROUTE_HOME,
	ROUTE_USERS_PAGE,
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
							<span className="text-sm mr-3">{appTitle}</span>
							{account?.type ? (
								<Tag
									type={
										account?.type === "CONSUMER"
											? "teal"
											: account?.type === "DISTRIBUTOR"
												? "purple"
												: "blue"
									}
									className="capitalize text-[12px] font-semibold ml-2"
								>
									as {account?.type?.toLowerCase()}
								</Tag>
							) : (
								""
							)}
						</Link>
						<HeaderNavigation aria-label="Hello Future Navigation">
							<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
								<Link className="h-full" href={ROUTE_USERS_PAGE}>
									Users
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
										<Link href={ROUTE_USERS_PAGE}>Users</Link>
									</HeaderMenuItem>
									<HeaderMenuItem onMouseDown={(e: any) => e.preventDefault()}>
										<Link href={ROUTE_ADMIN_PAGE}>Admin</Link>
									</HeaderMenuItem>
								</HeaderSideNavItems>
							</SideNavItems>
						</SideNav>
						<HeaderGlobalBar>
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
