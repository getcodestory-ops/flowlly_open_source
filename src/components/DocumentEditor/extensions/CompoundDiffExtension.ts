import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CompoundDiffComponent from "./CompoundDiffComponent";

export interface CompoundDiffOptions {
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		compoundDiff: {
			/**
			 * Insert a compound diff node
			 */
			insertCompoundDiff: (attributes: { 
				originalContent: string; 
				revisedContent: string; 
				diffGroup?: string;
			}) => ReturnType;
			/**
			 * Remove all compound diff nodes
			 */
			clearCompoundDiffs: () => ReturnType;
			/**
			 * Insert a sample compound diff for testing
			 */
			insertSampleCompoundDiff: () => ReturnType;
		};
	}
}

export const CompoundDiffExtension = Node.create<CompoundDiffOptions>({
	name: "compoundDiff",

	group: "inline",

	inline: true,

	atom: true,

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addAttributes() {
		return {
			originalContent: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-original"),
				renderHTML: (attributes) => {
					return {
						"data-original": attributes.originalContent,
					};
				},
			},
			revisedContent: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-revised"),
				renderHTML: (attributes) => {
					return {
						"data-revised": attributes.revisedContent,
					};
				},
			},
			diffGroup: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-diff-group"),
				renderHTML: (attributes) => {
					if (!attributes.diffGroup) {
						return {};
					}
					return {
						"data-diff-group": attributes.diffGroup,
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "compound-diff",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["compound-diff", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(CompoundDiffComponent);
	},

	addCommands() {
		return {
			insertCompoundDiff: (attributes) => ({ commands }) => {
				return commands.insertContent({
					type: this.name,
					attrs: attributes,
				});
			},
			clearCompoundDiffs: () => ({ tr, state }) => {
				const { doc } = state;
				let hasChanges = false;

				doc.descendants((node, pos) => {
					if (node.type.name === this.name) {
						tr.delete(pos, pos + node.nodeSize);
						hasChanges = true;
					}
				});

				return hasChanges;
			},

		};
	},

}); 