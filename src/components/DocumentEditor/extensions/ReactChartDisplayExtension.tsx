import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ChartDisplay from "./ChartDisplay";

export default Node.create({
	name: "chart",

	group: "block",

	atom: true,

	addAttributes() {
		return {
		
			jsx: {
				default: "",
				parseHTML: (element) => {
					const content = element.innerHTML.trim();
					return content || element.getAttribute("jsx") || "";
				},
				renderHTML: (attributes) => {
					return { jsx: attributes.jsx };
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "chart",
		
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ChartDisplay);
	},
});