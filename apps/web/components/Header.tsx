
"use client";

import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
} from "@carbon/react";
import { Notification, UserAvatar } from "@carbon/icons-react";

import Link from "next/link";

interface ContainerHeaderProps {
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
}

export function ContainerHeader  () {
  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }: ContainerHeaderProps) => (
        <Header aria-label="Carbon Tutorial">
          <SkipToContent />
          <HeaderMenuButton
            aria-label="Open menu"
            onClick={onClickSideNavExpand}
            isActive={isSideNavExpanded}
          />
          <Link href="/" passHref legacyBehavior>
            <HeaderName prefix="">Hello Future</HeaderName>
          </Link>
          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isPersistent={false}
          >
            <SideNavItems>
              <HeaderSideNavItems>
                <Link href="/repos" passHref legacyBehavior>
                  <HeaderMenuItem>Repositories</HeaderMenuItem>
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
              aria-label="User Avatar"
              tooltipAlignment="center"
              className="action-icons"
            >
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      )}
    />
  )
}
