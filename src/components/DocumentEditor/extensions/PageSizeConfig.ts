/**
 * Page Size Configuration for the Document Editor
 * Defines available page sizes and their dimensions for paged view
 */

// Page size type - "none" for normal view, others for paged view
export type PageSizeType = "none" | "a4" | "letter" | "legal" | "a3" | "a5";

export interface PageSize {
	id: PageSizeType;
	name: string;
	width: number;  // in pixels at 96 DPI
	height: number; // in pixels at 96 DPI
	description?: string;
}

// Page size definitions (dimensions in pixels at 96 DPI)
export const PAGE_SIZES: Record<PageSizeType, PageSize> = {
	none: { 
		id: "none", 
		name: "None", 
		width: 768, 
		height: 0,
		description: "No pagination - continuous scroll"
	},
	a4: { 
		id: "a4", 
		name: "A4", 
		width: 794, 
		height: 1123,
		description: "210mm × 297mm (International standard)"
	},
	letter: { 
		id: "letter", 
		name: "US Letter", 
		width: 816, 
		height: 1056,
		description: "8.5\" × 11\" (US standard)"
	},
	legal: { 
		id: "legal", 
		name: "US Legal", 
		width: 816, 
		height: 1344,
		description: "8.5\" × 14\" (US legal documents)"
	},
	a3: { 
		id: "a3", 
		name: "A3", 
		width: 1123, 
		height: 1587,
		description: "297mm × 420mm (Large format)"
	},
	a5: { 
		id: "a5", 
		name: "A5", 
		width: 559, 
		height: 794,
		description: "148mm × 210mm (Half of A4)"
	},
};

// Default margins in pixels (~25mm top/bottom, ~20mm sides)
export const PAGE_MARGINS = {
	top: 96,
	bottom: 96,
	left: 76,
	right: 76,
} as const;

// Helper function to calculate content height for a page size
export const getPageContentHeight = (pageSizeId: PageSizeType): number => {
	const pageSize = PAGE_SIZES[pageSizeId];
	if (pageSize.height === 0) return 0; // "none" has no height
	return pageSize.height - PAGE_MARGINS.top - PAGE_MARGINS.bottom;
};

// Helper function to check if paged view is enabled
export const isPagedView = (pageSizeId: PageSizeType): boolean => {
	return pageSizeId !== "none";
};

// Default page size
export const DEFAULT_PAGE_SIZE: PageSizeType = "none";

// Zoom level configuration
export type ZoomLevel = 50 | 75 | 80 | 90 | 100 | 125 | 150;

export const ZOOM_LEVELS: { value: ZoomLevel; label: string }[] = [
	{ value: 50, label: "50%" },
	{ value: 75, label: "75%" },
	{ value: 80, label: "80%" },
	{ value: 90, label: "90%" },
	{ value: 100, label: "100%" },
	{ value: 125, label: "125%" },
	{ value: 150, label: "150%" },
];

// Default zoom level - 80% shows more content while remaining readable
export const DEFAULT_ZOOM: ZoomLevel = 75;
