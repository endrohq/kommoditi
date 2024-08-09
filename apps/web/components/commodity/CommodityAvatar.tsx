import { ListingOutlined } from "@/components/icons/ListingOutlined";
import { MinusOutlined } from "@/components/icons/MinusOutlined";
import { VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";

const variants = cva("rounded-full flex items-center text-lg justify-center ", {
	variants: {
		variant: {
			default: "bg-gray-200 text-gray-400",
			listed: "bg-red-100 text-red-800",
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
			{variant === "listed" ? <ListingOutlined /> : <MinusOutlined />}
		</div>
	);
}
