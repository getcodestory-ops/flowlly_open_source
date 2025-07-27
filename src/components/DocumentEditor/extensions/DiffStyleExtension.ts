import { mergeAttributes } from "@tiptap/core";
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
			"data-diff-group": {
				default: null,
				parseHTML: (element) => element.getAttribute("data-diff-group"),
				renderHTML: (attributes) => {
					if (!attributes["data-diff-group"]) {
						return {};
					}
					
					return {
						"data-diff-group": attributes["data-diff-group"],
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
          .ProseMirror {
            position: relative;
          }

          /* Enhanced diff styling */
          mark[data-color="#f98181"],
          mark.delete {
            background-color: #f98181;
            color: inherit;
            padding: 2px 4px;
            border-radius: 3px;
            position: relative;
            cursor: pointer;
          }

          mark[data-color="#8ce99a"],
          mark.insert {
            background-color: #8ce99a;
            color: inherit;
            padding: 2px 4px;
            border-radius: 3px;
            position: relative;
            cursor: pointer;
          }

          /* Hover effect for diff marks */
          mark[data-color="#f98181"]:hover,
          mark.delete:hover {
            box-shadow: 0 2px 8px rgba(249, 129, 129, 0.4);
            transform: translateY(-1px);
            transition: all 0.2s ease;
          }

          mark[data-color="#8ce99a"]:hover,
          mark.insert:hover {
            box-shadow: 0 2px 8px rgba(140, 233, 154, 0.4);
            transform: translateY(-1px);
            transition: all 0.2s ease;
          }

          /* Global floating action panel for diff content */
          .diff-action-panel {
            position: fixed;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 120px;
          }

          .diff-action-panel.visible {
            display: flex;
          }

          .diff-action-button {
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            border: none;
            transition: background-color 0.2s;
            width: 100%;
          }

          .diff-action-accept {
            color: #1f883d;
            background-color: #dafbe1;
            border: 1px solid #7ee787;
          }

          .diff-action-accept:hover {
            background-color: #c0f5c8;
          }

          .diff-action-reject {
            color: #d1242f;
            background-color: #ffebe9;
            border: 1px solid #ffa198;
          }

          .diff-action-reject:hover {
            background-color: #ffd4d0;
          }

          .diff-action-info {
            font-size: 11px;
            color: #666;
            text-align: center;
            padding: 4px;
            border-bottom: 1px solid #eee;
            margin-bottom: 4px;
          }
        `;
				document.head.appendChild(style);

				// Create a global action panel
				const actionPanel = document.createElement("div");
				actionPanel.className = "diff-action-panel";
				
				const infoDiv = document.createElement("div");
				infoDiv.className = "diff-action-info";
				
				const acceptButton = document.createElement("button");
				acceptButton.className = "diff-action-button diff-action-accept";
				
				const rejectButton = document.createElement("button");
				rejectButton.className = "diff-action-button diff-action-reject";
				
				actionPanel.appendChild(infoDiv);
				actionPanel.appendChild(acceptButton);
				actionPanel.appendChild(rejectButton);
				document.body.appendChild(actionPanel);

				let currentDiffElement: HTMLElement | null = null;
				let currentIsDelete = false;
				let currentDiffGroup: string | null = null;

				// Function to handle individual accept/reject actions
				const handleIndividualAction = (diffGroupId: string, isApply: boolean) => {
					const { state, dispatch } = editorView;
					const { schema } = state;
					const targetMarkType = schema.marks[diffMarkName];

					if (!targetMarkType) return;

					try {
						// Find all elements with the same diff group ID
						const editorElement = editorView.dom;
						const groupElements = editorElement.querySelectorAll(`mark[data-diff-group="${diffGroupId}"]`);
						
						let tr = state.tr;
						let hasChanges = false;

						// Process elements in reverse order to maintain positions
						const elementsArray = Array.from(groupElements).reverse();
						
						for (const element of elementsArray) {
							const htmlElement = element as HTMLElement;
							const isDelete = htmlElement.classList.contains("delete") || 
								htmlElement.getAttribute("data-color") === deletionColor;
							const isInsert = htmlElement.classList.contains("insert") || 
								htmlElement.getAttribute("data-color") === insertionColor;

							if (isDelete || isInsert) {
								const pos = editorView.posAtDOM(htmlElement, 0);
								const node = state.doc.nodeAt(pos);
								
								if (node) {
									if (isApply) {
										if (isDelete) {
											// Apply change: remove the deleted content
											tr = tr.delete(pos, pos + node.nodeSize);
											hasChanges = true;
										} else if (isInsert) {
											// Apply change: keep insertion, remove highlight
											tr = tr.removeMark(pos, pos + node.nodeSize, targetMarkType);
											hasChanges = true;
										}
									} else {
										if (isDelete) {
											// Reject change: keep deleted content, remove highlight
											tr = tr.removeMark(pos, pos + node.nodeSize, targetMarkType);
											hasChanges = true;
										} else if (isInsert) {
											// Reject change: remove the inserted content
											tr = tr.delete(pos, pos + node.nodeSize);
											hasChanges = true;
										}
									}
								}
							}
						}

						if (hasChanges) {
							dispatch(tr);
						}

						// Hide the action panel
						actionPanel.classList.remove("visible");
						currentDiffElement = null;
						currentDiffGroup = null;
					} catch (error) {
						console.warn("Could not handle diff action:", error);
					}
				};

				// Setup event listeners for the action panel
				acceptButton.addEventListener("click", () => {
					if (currentDiffGroup) {
						handleIndividualAction(currentDiffGroup, true);
					}
				});

				rejectButton.addEventListener("click", () => {
					if (currentDiffGroup) {
						handleIndividualAction(currentDiffGroup, false);
					}
				});

				// Add click event listener to the editor
				const handleEditorClick = (event: MouseEvent) => {
					const target = event.target as HTMLElement;
					if (target && target.tagName === "MARK") {
						const dataColor = target.getAttribute("data-color");
						const classList = target.classList;
						const diffGroupId = target.getAttribute("data-diff-group");

						const isDelete = dataColor === deletionColor || classList.contains("delete");
						const isInsert = dataColor === insertionColor || classList.contains("insert");

						if ((isDelete || isInsert) && diffGroupId) {
							currentDiffElement = target;
							currentIsDelete = isDelete;
							currentDiffGroup = diffGroupId;

							// Update panel content for diff groups
							infoDiv.textContent = "Diff Change";
							acceptButton.textContent = "Apply Change";
							rejectButton.textContent = "Reject Change";

							// Position the panel near the clicked element
							const rect = target.getBoundingClientRect();
							const panelWidth = 120; // min-width from CSS
							const panelHeight = 80; // approximate height
							
							// Calculate position to show panel near the element
							let left = rect.right + 10; // 10px to the right of the element
							let top = rect.top - panelHeight / 2; // vertically center with the element
							
							// Ensure panel doesn't go off-screen
							if (left + panelWidth > window.innerWidth) {
								left = rect.left - panelWidth - 10; // show to the left instead
							}
							
							if (top < 10) {
								top = 10; // don't go above viewport
							} else if (top + panelHeight > window.innerHeight) {
								top = window.innerHeight - panelHeight - 10; // don't go below viewport
							}
							
							actionPanel.style.left = `${left}px`;
							actionPanel.style.top = `${top}px`;

							// Show the action panel
							actionPanel.classList.add("visible");
							
							// Prevent the click from bubbling
							event.stopPropagation();
						}
					} else {
						// Hide panel if clicking elsewhere
						actionPanel.classList.remove("visible");
						currentDiffElement = null;
						currentDiffGroup = null;
					}
				};

				editorView.dom.addEventListener("click", handleEditorClick);

				return {
					update(view, prevState) {
						// Don't do anything on updates to prevent infinite loops
					},
					destroy: () => {
						const styleElement = document.getElementById("diff-actions-style");
						if (styleElement) {
							styleElement.remove();
						}
						if (actionPanel.parentNode) {
							actionPanel.parentNode.removeChild(actionPanel);
						}
						editorView.dom.removeEventListener("click", handleEditorClick);
					},
				};
			},
		});

		return [...pluginsFromParent, diffButtonsPlugin];
	},
});
