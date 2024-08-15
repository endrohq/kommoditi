import { formatNumber } from "@/utils/number.utils";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

type NumericInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"onChange" | "value" | "max"
> & {
	value?: number;
	onChange: (value?: number) => void;
	max?: number;
	onCorrection?: () => void;
};

export function NumericInput({
	value,
	onChange,
	className,
	max,
	onCorrection,
	...props
}: NumericInputProps) {
	const [displayValue, setDisplayValue] = useState<string>(
		value?.toString() || "",
	);

	useEffect(() => {
		setDisplayValue(value?.toString() || "");
	}, [value]);

	useEffect(() => {
		// Check if the current value exceeds the new max
		if (max !== undefined && value !== undefined && value > max) {
			setDisplayValue(max.toString());
			onChange(max);
			onCorrection?.();
		}
	}, [max, value, onChange, onCorrection]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;

		// Allow empty input, numbers, one decimal point, and remove any other characters
		const sanitizedValue = inputValue
			.replace(/[^0-9.]/g, "")
			.replace(/(\..*)\./g, "$1");

		let parsedValue = parseFloat(sanitizedValue);

		// Check if the parsed value exceeds the max value
		if (max !== undefined && !isNaN(parsedValue) && parsedValue > max) {
			parsedValue = max;
			setDisplayValue(max.toString());
			onCorrection?.();
		} else {
			setDisplayValue(sanitizedValue);
		}

		// Convert to number format for backend processing
		if (sanitizedValue === "" || isNaN(parsedValue)) {
			onChange(undefined);
		} else {
			onChange(parsedValue);
		}
	};

	const handleBlur = () => {
		// Format the number on blur
		const numberValue = displayValue !== "" && displayValue;
		if (!numberValue) return;
		const formattedValue = parseFloat(numberValue);
		setDisplayValue(formattedValue?.toString() || "");
	};

	const handleFocus = () => {
		// Remove formatting on focus
		if (!displayValue) return;
		const numberValue = parseFloat(displayValue.replace(/,/g, ""));
		setDisplayValue(numberValue.toString());
	};

	return (
		<input
			type="text"
			value={displayValue}
			onChange={handleChange}
			onBlur={handleBlur}
			onFocus={handleFocus}
			inputMode="decimal"
			autoComplete="off"
			autoCorrect="off"
			pattern="^[0-9]*[.,]?[0-9]*$"
			className={clsx(
				className,
				"w-full bg-transparent border-none outline-none",
			)}
			{...props}
		/>
	);
}
