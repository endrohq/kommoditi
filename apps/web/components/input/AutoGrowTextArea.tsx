import clsx from "clsx";
import React, { useEffect, useRef } from "react";

interface TextareaProps
	extends Omit<
		React.InputHTMLAttributes<HTMLTextAreaElement>,
		"value" | "defaultValue" | "onChange" | "children"
	> {
	value: string | undefined;
	onChange(value: string): void;
}

export function AutoGrowTextarea({
	value,
	onChange,
	className,
	...props
}: TextareaProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textareaRef.current) {
			// Reset the height to recalculate the new height
			textareaRef.current.style.height = "auto";
			// Set the new height based on the scroll height
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [value]); // Update effect when content changes

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange(event.target.value);
	};

	return (
		<textarea
			{...props}
			className={clsx(className, "border-0 outline-none")}
			ref={textareaRef}
			value={value}
			onChange={handleChange}
			style={{
				width: "100%",
				minHeight: "40px",
				overflow: "hidden",
				resize: "none",
				boxSizing: "border-box",
			}}
		/>
	);
}
