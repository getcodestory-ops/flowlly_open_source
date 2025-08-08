import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Extension to support <div> elements in TipTap editor
 * This allows div elements to be preserved when using getHTML()
 */
export const DivExtension = Node.create({
	name: "div",
	
	group: "block",
	
	content: "block*",
	
	parseHTML() {
		return [
			{
				tag: "div",
			},
		];
	},
	
	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes), 0];
	},
});

export default DivExtension;
