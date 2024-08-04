"use client";

import { HomeOutlined } from "@/components/icons/HomeOutlined";
import { PlusCircleOutlined } from "@/components/icons/PlusCircleOutlined";
import { UserOutlined } from "@/components/icons/UserOutlined";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
	{
		label: "Home",
		href: "/producers",
		icon: <HomeOutlined />,
	},
	{
		label: "List Commodity",
		href: "/producers/add",
		icon: <PlusCircleOutlined />,
	},
	{
		label: "Profile",
		href: "/producers/profile",
		icon: <UserOutlined />,
	},
];

export function MobileMenuBar() {
	const pathname = usePathname();
	return (
		<nav style={{ borderTop: "1px solid #eee" }} className="bg-white border-t">
			<ul className="flex justify-around px-10 pb-2 pt-4">
				{items.map((item) => (
					<li>
						<Link
							href={item.href}
							className={clsx(
								"flex flex-col items-center justify-center space-y-1 hover:text-blue-700",
								pathname === item.href
									? "font-medium text-black"
									: "text-gray-500 ",
							)}
						>
							{item.icon}
							{item.label && (
								<span className="text-[10px] uppercase">{item.label}</span>
							)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
