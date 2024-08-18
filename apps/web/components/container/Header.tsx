"use client";

import { ChevronDown, UserAvatar } from "@carbon/icons-react";
import {
	Button,
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
} from "@/utils/route.utils";
import Link from "next/link";
import React, { useRef, useState } from "react";

interface ContainerHeaderProps {
	isSideNavExpanded: boolean;
	onClickSideNavExpand: () => void;
}

export function ContainerHeader() {
	const { isAuthenticated, account, login, logout, isLoading } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const menuButtonRef = useRef(null);

	const handleMenuToggle = () => {
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
							{isLoading ? (
								<HeaderGlobalAction
									className="action-icons relative"
									aria-label="Loading"
								>
									<LoadingOutlined className="text-white" />
								</HeaderGlobalAction>
							) : !isAuthenticated ? (
								<HeaderGlobalAction aria-label="Login" onClick={login}>
									<Button className="mr-10" kind="ghost" size="sm">
										Login
									</Button>
								</HeaderGlobalAction>
							) : (
								<HeaderGlobalAction
									// @ts-ignore
									ref={menuButtonRef}
									aria-label="User menu"
									onClick={handleMenuToggle}
									className="flex items-center justify-between px-2 custom-avatar-menu"
									style={{ width: "auto", minWidth: "150px" }}
								>
									<div className="flex items-center">
										{account?.address && (
											<EthAvatar address={account.address} size={24} />
										)}
										<span className="ml-2 text-sm truncate max-w-[100px]">
											{account?.address
												? `0x${account.address.slice(2, 6)}...${account.address.slice(-4)}`
												: "User"}
										</span>
									</div>
									<ChevronDown size={16} className="ml-2" />
									<OverflowMenu
										open={isOpen}
										flipped
										renderIcon={() => <></>}
										className="custom-overflow-menu !w-0"
										style={{
											background: "transparent",
										}}
										onOpen={() => setIsOpen(true)}
										onClose={() => setIsOpen(false)}
									>
										<Link href={`/profile/${account?.address}`}>
											<OverflowMenuItem itemText="Profile" />
										</Link>
										<OverflowMenuItem
											onClick={logout}
											itemText="Logout"
											hasDivider
										/>
									</OverflowMenu>
								</HeaderGlobalAction>
							)}
						</HeaderGlobalBar>
					</Header>
				)}
			/>
		</Theme>
	);
}
