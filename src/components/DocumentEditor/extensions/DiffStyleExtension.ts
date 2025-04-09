import { Mark } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const DiffStyleExtension = Mark.create({
	name: "diffStyle",

	addOptions() {
		return {
			showDiffButtons: false,
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: ["paragraph"],
				attributes: {
					class: {
						default: null,
						parseHTML: (element) => element.getAttribute("class"),
						renderHTML: (attributes) => {
							if (!attributes.class) {
								return {};
							}
							return {
								class: attributes.class,
							};
						},
					},
				},
			},
		];
	},

	addProseMirrorPlugins() {
		const { showDiffButtons } = this.options;
		
		return [
			new Plugin({
				key: new PluginKey("diffStyle"),
				view: (editorView) => {
					// Add styles to document
					const style = document.createElement("style");
					style.id = "diff-style";
					style.textContent = `
            .ProseMirror .original,
            .ProseMirror .updated,
            .ProseMirror .insert,
            .ProseMirror .delete {
              position: relative;
              box-sizing: border-box;
              width: 750px;
			  margin-left: -41px;
			  padding-left: 41px;

            }
			  

            .ProseMirror .original,
            .ProseMirror .delete {
              background-color: rgba(255, 0, 0, 0.5);
            }

            .ProseMirror .updated {
              background-color: rgba(0, 255, 0, 0.2);
            }

            .ProseMirror .insert {
              background-color: rgba(0, 0, 255, 0.2);
            }

            /* Accept button */
            .ProseMirror .original::before,
            .ProseMirror .updated::before,
            .ProseMirror .insert::before,
            .ProseMirror .delete::before {
              content: ${showDiffButtons ? "'Accept'" : "''"};
              position: absolute;
              right: 52px;
              top: calc(50%);
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 10px;
              opacity: 0;
              transition: opacity 0.2s;
              padding: 2px 6px;
              border-radius: 0px 0px 12px 12px;
              border: 1px solid #2da44e;
              color: #2da44e;
              background-color: rgba(45, 164, 78, 0.1);
              z-index: 2;
              pointer-events: ${showDiffButtons ? "auto" : "none"};
            }

            /* Reject button */
            .ProseMirror .original::after,
            .ProseMirror .updated::after,
            .ProseMirror .insert::after,
            .ProseMirror .delete::after {
              content: ${showDiffButtons ? "'Reject'" : "''"};
              position: absolute;
              right: 10px;
              top: calc(50%);
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 10px;
              opacity: 0;
              transition: opacity 0.2s;
              padding: 2px 6px;
              border-radius: 0px 0px 12px 12px;
              border: 1px solid #cf222e;
              color: #cf222e;
              background-color: rgba(207, 34, 46, 0.1);
              z-index: 2;
              pointer-events: ${showDiffButtons ? "auto" : "none"};
            }

            /* Add a gradient background behind buttons */
            .ProseMirror .original,
            .ProseMirror .updated,
            .ProseMirror .insert,
            .ProseMirror .delete {
              background-image: linear-gradient(to right, transparent 60%, rgba(255, 255, 255, 0.9) 75%);
              background-size: 200% 100%;
              background-position: left;
              transition: background-position 0.2s;
            }

            .ProseMirror .original:hover,
            .ProseMirror .updated:hover,
            .ProseMirror .insert:hover,
            .ProseMirror .delete:hover {
              background-position: right;
            }

            .ProseMirror .original:hover::before,
            .ProseMirror .original:hover::after,
            .ProseMirror .updated:hover::before,
            .ProseMirror .updated:hover::after,
            .ProseMirror .insert:hover::before,
            .ProseMirror .insert:hover::after,
            .ProseMirror .delete:hover::before,
            .ProseMirror .delete:hover::after {
              opacity: ${showDiffButtons ? "1" : "0"};
            }

            /* Action buttons container */
            .ProseMirror-diff-actions {
              display: ${showDiffButtons ? "flex" : "none"};
              position: sticky;
              top: 0px;
              border-radius: 12px 12px 0 0;
              z-index: 100;
              background-color: white;
            }

            /* Make sure the parent container has a relative position */
            .ProseMirror {
              position: relative;
              min-height: 100px; /* Ensure there's always space for the buttons */
            }

            .ProseMirror-diff-button {
              padding: 2px 6px;
              border-radius: 12px 12px 0 0;
              cursor: pointer;
              transition: all 0.2s;
              font-size: 10px;
            }

            .ProseMirror-diff-button:hover {
              background: #f0f0f0;
              transform: translateY(-1px);
            }

            .ProseMirror-diff-accept-all {
              color: #2da44e;
              border-color: #2da44e;
              background-color: rgba(45, 164, 78, 0.1);
            }

            .ProseMirror-diff-reject-all {
              color: #cf222e;
              border-color: #cf222e;
              background-color: rgba(207, 34, 46, 0.1);
            }
          `;
					document.head.appendChild(style);

					// Create action buttons
					const actionsContainer = document.createElement("div");
					actionsContainer.className = "ProseMirror-diff-actions";
					actionsContainer.style.display = showDiffButtons ? "flex" : "none";

					const acceptAllButton = document.createElement("button");
					acceptAllButton.className =
						"ProseMirror-diff-button ProseMirror-diff-accept-all";
					acceptAllButton.textContent = "Accept All Changes";

					const rejectAllButton = document.createElement("button");
					rejectAllButton.className =
						"ProseMirror-diff-button ProseMirror-diff-reject-all";
					rejectAllButton.textContent = "Reject All Changes";

					actionsContainer.appendChild(acceptAllButton);
					actionsContainer.appendChild(rejectAllButton);
					editorView.dom.parentElement?.insertBefore(
						actionsContainer,
						editorView.dom,
					);

					// Function to check if there are any changes and update button visibility
					const updateButtonsVisibility = () => {
						const hasChanges = editorView.dom.querySelector(
							".original, .updated, .insert, .delete",
						);
						actionsContainer.style.display = hasChanges && showDiffButtons ? "flex" : "none";
					};

					// Initial check
					updateButtonsVisibility();

					// Update visibility after each transaction
					editorView.state.tr.setMeta("addToHistory", false);
					editorView.dispatch(editorView.state.tr);

					const handleBulkAction = (isAccept: boolean) => {
						if (!showDiffButtons) return; // Don't handle actions if buttons are disabled

						const diffElements = Array.from(
							editorView.dom.querySelectorAll(
								".original, .updated, .insert, .delete",
							),
						);

						// Collect all changes with their positions
						const changes = diffElements.map((element) => {
							const paragraph = element as HTMLElement;
							const pos = editorView.posAtDOM(paragraph as Node, 0);
							const resolvedPos = editorView.state.doc.resolve(pos);
							return {
								start: resolvedPos.before(),
								end: resolvedPos.after(),
								content: paragraph.textContent || "",
								type: paragraph.className,
							};
						});

						// Sort changes by position in descending order (end to start)
						changes.sort((a, b) => b.start - a.start);

						let tr = editorView.state.tr;

						// Apply changes from end to start
						changes.forEach(({ start, end, content, type }) => {
							if (isAccept) {
								// Accept changes
								switch (type) {
									case "original":
									case "delete":
										// Delete content
										tr = tr.delete(start, end);
										break;
									case "updated":
									case "insert":
										// Replace with plain paragraph
										const newNode =
											editorView.state.schema.nodes.paragraph.create(
												null,
												editorView.state.schema.text(content),
											);
										tr = tr.replaceWith(start, end, newNode);
										break;
								}
							} else {
								// Reject changes
								switch (type) {
									case "original":
									case "delete":
										// Keep content as plain paragraph
										const newNode =
											editorView.state.schema.nodes.paragraph.create(
												null,
												editorView.state.schema.text(content),
											);
										tr = tr.replaceWith(start, end, newNode);
										break;
									case "updated":
									case "insert":
										// Delete content
										tr = tr.delete(start, end);
										break;
								}
							}
						});

						editorView.dispatch(tr);
						// Check visibility after changes
						updateButtonsVisibility();
					};

					acceptAllButton.addEventListener("click", () =>
						handleBulkAction(true),
					);
					rejectAllButton.addEventListener("click", () =>
						handleBulkAction(false),
					);

					// Add click handler for delete buttons
					const handleClick = (event: MouseEvent) => {
						const target = event.target as HTMLElement;
						const paragraph = target.closest(
							".original, .updated, .insert, .delete",
						) as HTMLElement;

						if (!paragraph) return;

						// Calculate if click was on accept or reject button based on position
						const rect = paragraph.getBoundingClientRect();
						const rightOffset = rect.right - event.clientX;
						
						// Check if click is in the button area (top half of paragraph)
						const isInButtonArea = rightOffset <= 100; // Area where buttons are visible
						if (!isInButtonArea) return;

						const isAcceptButton = rightOffset >= 35 && rightOffset <= 85; // Accept button area
						const isRejectButton = rightOffset <= 35; // Reject button area
						
						if (!isAcceptButton && !isRejectButton) return;

						const pos = editorView.posAtDOM(paragraph as Node, 0);
						const resolvedPos = editorView.state.doc.resolve(pos);
						const start = resolvedPos.before();
						const end = resolvedPos.after();
						const content = paragraph.textContent || "";
						const type = paragraph.className;

						let tr = editorView.state.tr;

						if (isAcceptButton) {
							// Accept changes
							switch (type) {
								case "original":
								case "delete":
									// Delete content
									tr = tr.delete(start, end);
									break;
								case "updated":
								case "insert":
									// Replace with plain paragraph
									tr = tr
										.deleteRange(start, end)
										.insert(
											start,
											editorView.state.schema.nodes.paragraph.create(
												null,
												editorView.state.schema.text(content),
											),
										);
									break;
							}
						} else {
							// Reject changes
							switch (type) {
								case "original":
								case "delete":
									// Keep content as plain paragraph
									tr = tr
										.deleteRange(start, end)
										.insert(
											start,
											editorView.state.schema.nodes.paragraph.create(
												null,
												editorView.state.schema.text(content),
											),
										);
									break;
								case "updated":
								case "insert":
									// Delete content
									tr = tr.delete(start, end);
									break;
							}
						}

						editorView.dispatch(tr);
						// Check visibility after changes
						updateButtonsVisibility();
					};

					editorView.dom.addEventListener("click", handleClick);

					return {
						destroy: () => {
							// Clean up styles and event listeners when editor is destroyed
							const styleElement = document.getElementById("diff-style");
							if (styleElement) {
								styleElement.remove();
							}
							actionsContainer.remove();
							editorView.dom.removeEventListener("click", handleClick);
						},
					};
				},
			}),
		];
	},
});
