import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * Extension to support <span> elements in TipTap editor
 * This allows span elements to be preserved when using getHTML()
 */
export const SpanExtension = Mark.create({
	name: "span",
	
	parseHTML() {
		return [
			{
				tag: "span",
			},
		];
	},
	
	renderHTML({ HTMLAttributes }) {
		return ["span", mergeAttributes(HTMLAttributes), 0];
	},
});

export default SpanExtension;
