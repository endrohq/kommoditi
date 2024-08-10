import { BankOutlined } from "@/components/icons/BankOutlined";
import { ListingOutlined } from "@/components/icons/ListingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";

const variants = cva("rounded-full flex items-center text-lg justify-center ", {
	variants: {
		variant: {
			default: "bg-gray-200 text-gray-400",
			listing: "bg-red-100 text-red-800",
			purchase: "bg-green-100 text-green-800",
		},
		size: {
			default: "w-10 h-10",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export interface CommodityAvatarProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof variants> {
	className?: string;
}

export function CommodityAvatar({
	variant,
	size,
	className,
}: CommodityAvatarProps) {
	return (
		<div className={clsx(variants({ variant, size, className }))}>
			{variant === "listing" ? (
				<ListingOutlined />
			) : variant === "purchase" ? (
				<BankOutlined />
			) : (
				<MinusOutlined />
			)}
		</div>
	);
}
