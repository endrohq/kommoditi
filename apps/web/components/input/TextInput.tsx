import clsx from "clsx";
import React from "react";

type TextInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"onChange" | "value"
> & {
	value?: string;
	onChange: (value?: string) => void;
};

export function TextInput({
	value,
	onChange,
	className,
	...props
}: TextInputProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		onChange(inputValue);
	};

	return (
		<input
			type="text"
			value={value}
			onChange={handleChange}
			inputMode="text"
			autoComplete="off"
			autoCorrect="off"
			className={clsx(
				className,
				"w-full bg-transparent border-none outline-none",
			)}
			{...props}
		/>
	);
}
