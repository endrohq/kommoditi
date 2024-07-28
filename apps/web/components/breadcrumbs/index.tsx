import { IconProps } from "@/components/icons/BaseIcon";
import { RightOutlined } from "@/components/icons/RightOutlined";
import clsx from "clsx";
import Link from "next/link";
import React, { ReactElement } from "react";

type BreadcrumbsProps = {
	crumbs?: { label: string; href?: string }[];
	icon?: ReactElement<IconProps>;
};

function BreadCrumbItem({
	label,
	href,
	isLast,
}: { label: string; href?: string; isLast?: boolean }) {
	const Component = href ? Link : "span";
	return (
		<Component
			href={href || ""}
			className={clsx("capitalize font-medium", {
				"text-gray-400": !href && !isLast,
				"text-gray-500 hover:text-blue-700 cursor-pointer": !!href && !isLast,
				"text-gray-800": isLast,
			})}
		>
			{label}
		</Component>
	);
}

export function Breadcrumbs({ crumbs, icon }: BreadcrumbsProps) {
	return (
		<nav className="flex gap-1.5 items-center">
			{icon && (
				<>
					{icon}
					<RightOutlined className="text-[9px]" />
				</>
			)}
			{(crumbs ?? []).map((c, i) => (
				<div
					key={`breadcrumb-${i}`}
					className="flex gap-2.5 text-[11.5px] sm:text-xs font-medium"
				>
					<BreadCrumbItem
						label={c?.label}
						href={c?.href}
						isLast={i === (crumbs?.length || 0) - 1}
					/>
					{i !== (crumbs?.length || 0) - 1 && (
						<RightOutlined className="text-[9px] text-gray-500" />
					)}
				</div>
			))}
		</nav>
	);
}
