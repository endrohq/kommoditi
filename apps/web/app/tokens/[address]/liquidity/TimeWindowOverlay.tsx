import { roundToTwoDecimals } from "@/utils/number.utils";
import { debounce } from "lodash"; // Make sure to install lodash if not already available
import React, { useState, useCallback, useEffect, useRef } from "react";

interface TimeWindowOverlayProps {
	minPrice: number;
	maxPrice: number;
	globalMinPrice: number;
	globalMaxPrice: number;
	onRangeChange: (min: number, max: number) => void;
}

export function TimeWindowOverlay({
	minPrice,
	maxPrice,
	globalMinPrice,
	globalMaxPrice,
	onRangeChange,
}: TimeWindowOverlayProps) {
	const [isDragging, setIsDragging] = useState<
		"left" | "right" | "middle" | null
	>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const [dragStart, setDragStart] = useState(0);
	const [localMinPrice, setLocalMinPrice] = useState(
		roundToTwoDecimals(minPrice),
	);
	const [localMaxPrice, setLocalMaxPrice] = useState(
		roundToTwoDecimals(maxPrice),
	);

	const getPosition = useCallback(
		(price: number) => {
			return (
				((price - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100
			);
		},
		[globalMinPrice, globalMaxPrice],
	);

	const leftPosition = getPosition(localMinPrice);
	const rightPosition = getPosition(localMaxPrice);

	const debouncedRangeChange = useCallback(
		debounce((min: number, max: number) => {
			onRangeChange(roundToTwoDecimals(min), roundToTwoDecimals(max));
		}, 200),
		[onRangeChange],
	);

	const handleMouseDown = (
		e: React.MouseEvent,
		type: "left" | "right" | "middle",
	) => {
		setIsDragging(type);
		setDragStart(e.clientX);
		e.preventDefault();
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !overlayRef.current) return;

			const rect = overlayRef.current.getBoundingClientRect();
			const width = rect.width;
			const deltaX = e.clientX - dragStart;
			const deltaPrice = (deltaX / width) * (globalMaxPrice - globalMinPrice);

			let newMin = localMinPrice;
			let newMax = localMaxPrice;

			if (isDragging === "left") {
				newMin = Math.max(
					globalMinPrice,
					Math.min(localMinPrice + deltaPrice, localMaxPrice - 0.01),
				);
			} else if (isDragging === "right") {
				newMax = Math.min(
					globalMaxPrice,
					Math.max(localMaxPrice + deltaPrice, localMinPrice + 0.01),
				);
			} else if (isDragging === "middle") {
				const range = localMaxPrice - localMinPrice;
				newMin = Math.max(
					globalMinPrice,
					Math.min(localMinPrice + deltaPrice, globalMaxPrice - range),
				);
				newMax = newMin + range;
			}

			newMin = roundToTwoDecimals(newMin);
			newMax = roundToTwoDecimals(newMax);

			setLocalMinPrice(newMin);
			setLocalMaxPrice(newMax);
			debouncedRangeChange(newMin, newMax);
			setDragStart(e.clientX);
		},
		[
			isDragging,
			localMinPrice,
			localMaxPrice,
			globalMinPrice,
			globalMaxPrice,
			debouncedRangeChange,
			dragStart,
		],
	);

	const handleMouseUp = () => {
		setIsDragging(null);
		onRangeChange(
			roundToTwoDecimals(localMinPrice),
			roundToTwoDecimals(localMaxPrice),
		);
	};

	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	useEffect(() => {
		setLocalMinPrice(roundToTwoDecimals(minPrice));
		setLocalMaxPrice(roundToTwoDecimals(maxPrice));
	}, [minPrice, maxPrice]);

	return (
		<div
			ref={overlayRef}
			className="absolute inset-x-0 top-0 bottom-5 pointer-events-none"
		>
			{/* Colored area between min and max */}
			<div
				className="absolute inset-y-0 bg-purple-400 bg-opacity-30 cursor-move pointer-events-auto"
				style={{
					left: `${leftPosition}%`,
					width: `${rightPosition - leftPosition}%`,
				}}
				onMouseDown={(e) => handleMouseDown(e, "middle")}
			/>
			<div
				className="absolute inset-y-0 w-0.5 bg-orange-500 cursor-ew-resize pointer-events-auto"
				style={{ left: `${leftPosition}%` }}
				onMouseDown={(e) => handleMouseDown(e, "left")}
			>
				<div className="absolute -top-1 -left-1.5 w-4 h-4 bg-orange-500" />
			</div>
			{/* Right handle */}
			<div
				className="absolute inset-y-0 w-0.5 bg-blue-500 cursor-ew-resize pointer-events-auto"
				style={{ left: `${rightPosition}%` }}
				onMouseDown={(e) => handleMouseDown(e, "right")}
			>
				<div className="absolute -top-1 -left-1.5 w-4 h-4 bg-blue-500" />
			</div>
		</div>
	);
}
