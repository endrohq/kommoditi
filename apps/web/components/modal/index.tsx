import { CloseOutlined } from "@/components/icons/CloseOutlined";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type ModalProps = {
	children: ReactNode;
	onClose?(): void;
	showClose?: boolean;
	bodyClassName?: string;
	wrapperWidth?:
		| "max-w-lg"
		| "max-w-xl"
		| "max-w-2xl"
		| "max-w-3xl"
		| "max-w-4xl"
		| "max-w-5xl"
		| "max-w-6xl";
	open: boolean;
	position?: "top" | "center" | "bottom" | "left" | "right";
	withPadding?: boolean;
};

export function Modal({
	children,
	onClose,
	showClose = true,
	open,
	position = "bottom",
	wrapperWidth = "max-w-lg",
	bodyClassName,
	withPadding = true,
}: ModalProps) {
	if (!open) return <></>;

	return (
		<div
			onClick={() => onClose?.()}
			className="fixed bg-black/25 inset-0 z-[9999] m-0 h-full p-0"
		>
			<AnimatePresence>
				<motion.div
					variants={{
						hidden: { y: "100%" },
						visible: { y: 0, transition: { duration: 0.15 } },
						exit: { y: "100%", transition: { duration: 0.15 } },
					}}
					className="flex h-full w-full items-center"
					initial="hidden"
					animate="visible"
					exit="exit"
				>
					<div
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						className={clsx(
							"mx-auto w-full overflow-y-visible bg-white ",
							{
								"absolute inset-0 z-10 rounded": !position,
								"absolute m-auto left-0 right-0 rounded top-32":
									position === "bottom",
								"fixed inset-0 left-auto": position === "right",
								"p-6": withPadding,
							},
							wrapperWidth,
						)}
					>
						{showClose && (
							<div className="flex w-full items-center justify-end">
								<div className="hover:bg-gray-100 rounded px-1 group">
									<CloseOutlined
										className="text-base cursor-pointer group-hover:text-black transition-colors text-gray-400"
										onClick={() => onClose?.()}
									/>
								</div>
							</div>
						)}
						<div className={clsx("h-full w-full", bodyClassName)}>
							{children}
						</div>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
