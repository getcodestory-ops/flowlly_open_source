import React from "react";
import type { CoverElement } from "../CoverPageDesigner";

export type StylePreset = "modern" | "classic";

export interface MarginBoxConfig {
	type: "text" | "page-counter" | "page-counter-total" | "running-header" | "image" | "none";
	content: string;
	runningSelector?: string;
}

export interface TemplateBuilderState {
	activeStep: number;
	templateName: string;
	useCase: string;
	stylePreset: StylePreset;
	brandColor: string;
	textColor: string;
	headerBgColor: string;
	includeCover: boolean;
	coverDesignMode: "simple" | "advanced";
	coverTitle: string;
	coverSubtitle: string;
	coverLogoUrl: string;
	preparedFor: string;
	preparedBy: string;
	dateText: string;
	coverElements: CoverElement[];
	marginBoxes: Record<string, MarginBoxConfig>;
	selectedMarginBox: string | null;
	editorHtml: string;
}

export function useTemplateBuilderState(): [TemplateBuilderState, React.Dispatch<React.SetStateAction<TemplateBuilderState>>] {
	const [state, setState] = React.useState<TemplateBuilderState>({
		activeStep: 1,
		templateName: "",
		useCase: "general",
		stylePreset: "modern",
		brandColor: "#3b82f6",
		textColor: "#0f172a",
		headerBgColor: "#f8fafc",
		includeCover: true,
		coverDesignMode: "simple",
		coverTitle: "",
		coverSubtitle: "",
		coverLogoUrl: "",
		preparedFor: "",
		preparedBy: "",
		dateText: "",
		coverElements: [],
		marginBoxes: {
			"top-left-corner": { type: "none", content: "" },
			"top-left": { type: "none", content: "" },
			"top-center": { type: "none", content: "" },
			"top-right": { type: "none", content: "" },
			"top-right-corner": { type: "none", content: "" },
			"left-top": { type: "none", content: "" },
			"left-middle": { type: "none", content: "" },
			"left-bottom": { type: "none", content: "" },
			"right-top": { type: "none", content: "" },
			"right-middle": { type: "none", content: "" },
			"right-bottom": { type: "none", content: "" },
			"bottom-left-corner": { type: "none", content: "" },
			"bottom-left": { type: "none", content: "" },
			"bottom-center": { type: "page-counter-total", content: "Page {page} of {total}" },
			"bottom-right": { type: "none", content: "" },
			"bottom-right-corner": { type: "none", content: "" },
		},
		selectedMarginBox: null,
		editorHtml: "",
	});

	return [state, setState];
}


