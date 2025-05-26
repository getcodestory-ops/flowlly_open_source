import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ChartDisplay from "./ChartDisplay";

export default Node.create({
	name: "chart",

	group: "block",

	atom: true,

	addAttributes() {
		return {
			data: {
				default: "{}",
				parseHTML: (element) => {
					// First try to get the data attribute directly
					const dataAttr = element.getAttribute("data");
					if (dataAttr) {
						return dataAttr;
					}
					
					// Fallback to innerHTML content (for backward compatibility)
					const content = element.innerHTML.trim();
					return content || "{}";
				},
				renderHTML: (attributes) => {
					return { data: attributes.data };
				},
			},
			id: {
				default: null,
				parseHTML: (element) => element.getAttribute("id"),
				renderHTML: (attributes) => {
					if (!attributes.id) {
						return {};
					}
					return { id: attributes.id };
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "chart",
			},
			{
				tag: "Chart", // Also support capitalized version
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["chart", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ChartDisplay);
	},
});