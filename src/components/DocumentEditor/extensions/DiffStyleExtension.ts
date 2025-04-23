import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { MarkType } from "prosemirror-model";
import Highlight from "@tiptap/extension-highlight";

interface DiffStyleOptions {
	showDiffButtons: boolean;
	deletionColor: string;
	insertionColor: string;
	diffMarkName: string;
	multicolor: boolean;
	HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		highlight: {
			/**
			 * Set a highlight mark
			 */
			setHighlight: (attributes?: { color: string }) => ReturnType;
			/**
			 * Toggle a highlight mark
			 */
			toggleHighlight: (attributes?: { color: string }) => ReturnType;
			/**
			 * Unset a highlight mark
			 */
			unsetHighlight: () => ReturnType;
		};
	}
}

export const DiffStyleExtension = Highlight.extend<DiffStyleOptions>({
	name: "highlight",

	addOptions() {
		return {
			...this.parent?.(),
			showDiffButtons: true,
			deletionColor: "#f98181",
			insertionColor: "#8ce99a",
			diffMarkName: "highlight",
			multicolor: true,
			HTMLAttributes: {
				class: "highlight",
			},
		};
	},

	addAttributes() {
		return {
			...this.parent?.(),
			"data-color": {
				default: null,
				parseHTML: (element) => element.getAttribute("data-color"),
				renderHTML: (attributes) => {
					if (!attributes["data-color"]) {
						return {};
					}
					
					return {
						"data-color": attributes["data-color"],
						style: `background-color: ${attributes["data-color"]}; color: inherit`,
					};
				},
			},
			class: {
				default: null,
				parseHTML: (element) => {
					// Get the full class attribute value
					return element.getAttribute("class");
				},
				renderHTML: (attributes) => {
					if (!attributes["class"]) {
						return {};
					}
					
					// Ensure highlight class doesn't override other classes
					// but gets added to them
					return {
						class: attributes["class"],
					};
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "mark[data-color]",
			},
			{
				tag: "mark.delete",
			},
			{
				tag: "mark.insert",
			},
			{
				tag: "span.highlight",
				getAttrs: (node) => node instanceof HTMLElement && node.classList.contains("highlight") 
					? {} 
					: false,
			},
			{
				tag: "mark",
				getAttrs: (node) => {
					if (node instanceof HTMLElement) {
						const hasRelevantClass = node.classList.contains("highlight") || 
							node.classList.contains("delete") || 
							node.classList.contains("insert");
						return hasRelevantClass ? {} : false;
					}
					return false;
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		// Ensure we're merging classes, not replacing them
		const attrs = { ...HTMLAttributes };
		
		// Make sure we keep all existing classes while adding highlight
		if (attrs.class) {
			// If class already contains highlight, don't add it again
			if (!attrs.class.includes("highlight")) {
				attrs.class = `highlight ${attrs.class}`;
			}
		} else {
			attrs.class = "highlight";
		}
		
		return [
			"mark",
			mergeAttributes(this.options.HTMLAttributes, attrs),
			0,
		];
	},

	addProseMirrorPlugins() {
		const pluginsFromParent = this.parent?.() || [];
		const { showDiffButtons, deletionColor, insertionColor, diffMarkName } = this.options;
		
		const diffButtonsPlugin = new Plugin({
			key: new PluginKey("diffActionsPlugin"),
			view: (editorView) => {
				const style = document.createElement("style");
				style.id = "diff-actions-style";
				style.textContent = `
          /* Action buttons container */
          .ProseMirror-diff-actions {
            display: flex;
            position: sticky;
            top: 0px;
            border-radius: 6px 6px 0 0;
            z-index: 100;
            background-color: white;
            padding: 4px 8px;
            border-bottom: 1px solid #ddd;
            gap: 8px;
            justify-content: flex-end;
            width: 100%;
            box-sizing: border-box;
          }

          .ProseMirror {
            position: relative;
          }

          .ProseMirror-diff-button {
            padding: 3px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
            font-size: 12px;
            border: 1px solid transparent;
            font-weight: 500;
          }

          .ProseMirror-diff-button:hover {
            background-color: #f0f0f0;
          }

          .ProseMirror-diff-accept-all {
            color: #1f883d;
            border-color: #7ee787;
            background-color: #dafbe1;
          }
           .ProseMirror-diff-accept-all:hover {
             background-color: #c0f5c8;
           }

          .ProseMirror-diff-reject-all {
            color: #d1242f;
            border-color: #ffa198;
            background-color: #ffebe9;
          }
           .ProseMirror-diff-reject-all:hover {
              background-color: #ffd4d0;
          }
        `;
				document.head.appendChild(style);

				const actionsContainer = document.createElement("div");
				actionsContainer.className = "ProseMirror-diff-actions";
				actionsContainer.style.display = "none";

				const acceptAllButton = document.createElement("button");
				acceptAllButton.className =
					"ProseMirror-diff-button ProseMirror-diff-accept-all";
				acceptAllButton.textContent = "Accept All";
				acceptAllButton.type = "button";

				const rejectAllButton = document.createElement("button");
				rejectAllButton.className =
					"ProseMirror-diff-button ProseMirror-diff-reject-all";
				rejectAllButton.textContent = "Reject All";
				rejectAllButton.type = "button";

				actionsContainer.appendChild(acceptAllButton);
				actionsContainer.appendChild(rejectAllButton);
				editorView.dom.parentElement?.insertBefore(
					actionsContainer,
					editorView.dom,
				);

				const updateButtonsVisibility = () => {
					if (!showDiffButtons) {
						actionsContainer.style.display = "none";
						return;
					}

					let hasChanges = false;
					const { doc, schema } = editorView.state;
					const targetMarkType = schema.marks[diffMarkName];

					if (!targetMarkType) {
						actionsContainer.style.display = "none";
						console.warn(`DiffActionsExtension: Mark type "${diffMarkName}" not found in schema.`);
						return;
					}
					
					doc.descendants((node: Node) => {
						// Check if this node has the highlight mark with the right class or color
						const hasDiffMark = node.marks.some((mark) => {
							const isTargetType = mark.type === targetMarkType;
							
							// Check for class-based indicators first
							if (mark.attrs.class === "delete" || mark.attrs.class === "insert") {
								return true;
							}
							
							// Fallback to color-based detection
							const hasRightColor = mark.attrs["data-color"] === deletionColor || 
													mark.attrs["data-color"] === insertionColor;
							
							return isTargetType && hasRightColor;
						});
						
						if (hasDiffMark) {
							hasChanges = true;
							return false; // Stop traversal once we found a change
						}
						return true;
					});

					actionsContainer.style.display = hasChanges ? "flex" : "none";
				};

				updateButtonsVisibility();

				const findDeletionRanges = (markType: MarkType): { from: number; to: number }[] => {
					const ranges: { from: number; to: number }[] = [];
					const { doc } = editorView.state;
					let activeRange: { from: number; to: number } | null = null;

					doc.descendants((node, pos) => {
						const mark = node.marks.find(
							(m) => m.type === markType && 
							(m.attrs.class === "delete" || m.attrs["data-color"] === deletionColor),
						);
						const markActive = !!mark;

						if (markActive && !activeRange) {
							activeRange = { from: pos, to: pos + node.nodeSize };
						} else if (markActive && activeRange) {
							activeRange.to = pos + node.nodeSize;
						} else if (!markActive && activeRange) {
							ranges.push(activeRange);
							activeRange = null;
						}
						return true;
					});

					if (activeRange) {
						ranges.push(activeRange);
					}
					return ranges;
				};
				
				const findInsertionRanges = (markType: MarkType): { from: number; to: number }[] => {
					const ranges: { from: number; to: number }[] = [];
					const { doc } = editorView.state;
					let activeRange: { from: number; to: number } | null = null;

					doc.descendants((node, pos) => {
						const mark = node.marks.find(
							(m) => m.type === markType && 
							(m.attrs.class === "insert" || m.attrs["data-color"] === insertionColor),
						);
						const markActive = !!mark;

						if (markActive && !activeRange) {
							activeRange = { from: pos, to: pos + node.nodeSize };
						} else if (markActive && activeRange) {
							activeRange.to = pos + node.nodeSize;
						} else if (!markActive && activeRange) {
							ranges.push(activeRange);
							activeRange = null;
						}
						return true;
					});

					if (activeRange) {
						ranges.push(activeRange);
					}
					return ranges;
				};

				const handleBulkAction = (isAccept: boolean) => {
					if (!showDiffButtons) return;

					let tr = editorView.state.tr;
					const { schema } = editorView.state;
					const targetMarkType = schema.marks[diffMarkName];

					if (!targetMarkType) {
						console.error(`DiffActionsExtension: Mark type "${diffMarkName}" not found in schema during bulk action.`);
						return;
					}

					const deletionRanges = findDeletionRanges(targetMarkType);
					const insertionRanges = findInsertionRanges(targetMarkType);

					const allChanges = [
						...deletionRanges.map((r) => ({ ...r, type: "delete" as const })),
						...insertionRanges.map((r) => ({ ...r, type: "insert" as const })),
					];
					allChanges.sort((a, b) => b.to - a.to);

					allChanges.forEach(({ from, to, type }) => {
						if (isAccept) {
							if (type === "delete") {
								tr = tr.delete(from, to);
							} else if (type === "insert") {
								tr = tr.removeMark(from, to, targetMarkType);
							}
						} else {
							if (type === "delete") {
								tr = tr.removeMark(from, to, targetMarkType);
							} else if (type === "insert") {
								tr = tr.delete(from, to);
							}
						}
					});

					if (tr.docChanged) {
						editorView.dispatch(tr);
						updateButtonsVisibility();
					}
				};

				acceptAllButton.addEventListener("click", () =>
					handleBulkAction(true),
				);
				rejectAllButton.addEventListener("click", () =>
					handleBulkAction(false),
				);

				return {
					update(view, prevState) {
						if (!prevState || !prevState.doc.eq(view.state.doc)) {
							updateButtonsVisibility();
						}
					},
					destroy: () => {
						const styleElement = document.getElementById("diff-actions-style");
						if (styleElement) {
							styleElement.remove();
						}
						actionsContainer.remove();
					},
				};
			},
		});

		return [...pluginsFromParent, diffButtonsPlugin];
	},
});
