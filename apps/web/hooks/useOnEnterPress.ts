import { useCallback } from "react";

export const useOnEnterPress = (callback: () => void) => {
	return useCallback(
		(event: React.KeyboardEvent) => {
			if (
				event.nativeEvent instanceof KeyboardEvent &&
				event.nativeEvent.key === "Enter"
			) {
				event.preventDefault();
				event.stopPropagation();
				callback();
			}
		},
		[callback],
	);
};
