// Types for cover page elements
export interface CoverElement {
	id: string;
	type: "text" | "image" | "logo";
	x: number; // Percentage from left
	y: number; // Percentage from top
	width: number; // Percentage of canvas width
	height: number; // Percentage of canvas height
	rotation?: number; // Degrees
	zIndex: number;
	
	// Text properties
	text?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: "normal" | "bold";
	fontStyle?: "normal" | "italic";
	textDecoration?: "none" | "underline";
	textAlign?: "left" | "center" | "right";
	color?: string;
	
	// Image properties
	src?: string;
	alt?: string;
	objectFit?: "contain" | "cover" | "fill";
	
	// Background and border
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
	borderRadius?: number;
	opacity?: number;
}

export interface CoverPageDesignerProps {
	elements: CoverElement[];
	onElementsChange: (elements: CoverElement[]) => void;
	canvasWidth?: number;
	canvasHeight?: number;
	// Simple form data
	coverTitle?: string;
	coverSubtitle?: string;
	coverLogoUrl?: string;
	dateText?: string;
	preparedFor?: string;
	preparedBy?: string;
	onSimpleFormChange?: (updates: {
		coverTitle?: string;
		coverSubtitle?: string;
		coverLogoUrl?: string;
		dateText?: string;
		preparedFor?: string;
		preparedBy?: string;
	}) => void;
}

export const DEFAULT_CANVAS_WIDTH = 600;
export const DEFAULT_CANVAS_HEIGHT = 848; // A4 aspect ratio (210/297) but larger
