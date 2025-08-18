import type { CoverElement } from "./types";

export const generateId = (): string => `element_${Date.now()}_${Math.random().toString(36)
	.substr(2, 9)}`;

export const createNewElement = (type: CoverElement["type"], elementsLength: number): CoverElement => ({
	id: generateId(),
	type,
	x: 20, // Start 20% from left
	y: 20, // Start 20% from top
	width: type === "text" ? 60 : 30, // Text wider, images smaller
	height: type === "text" ? 10 : 20,
	zIndex: elementsLength,
	...(type === "text" && {
		text: "Your text here",
		fontSize: 18,
		fontFamily: "Arial, sans-serif",
		fontWeight: "normal",
		fontStyle: "normal",
		textDecoration: "none",
		textAlign: "center",
		color: "#000000",
	}),
	...(type === "image" && {
		src: "",
		alt: "Image",
		objectFit: "contain",
	}),
	...(type === "logo" && {
		src: "",
		alt: "Logo",
		objectFit: "contain",
	}),
	backgroundColor: "transparent",
	borderColor: "#cccccc",
	borderWidth: 0,
	borderRadius: 0,
	opacity: 1,
});

export const duplicateElement = (element: CoverElement, elementsLength: number): CoverElement => ({
	...element,
	id: generateId(),
	x: element.x + 5, // Offset slightly
	y: element.y + 5,
	zIndex: elementsLength,
});

export const getZIndexChange = (elements: CoverElement[], direction: "front" | "back"): number => {
	const maxZ = Math.max(...elements.map((el) => el.zIndex));
	const minZ = Math.min(...elements.map((el) => el.zIndex));
	return direction === "front" ? maxZ + 1 : minZ - 1;
};
