import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const DiffStyleExtension = Extension.create({
  name: "diffStyle",

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
              padding-left: 60px;  /* Increased padding for two buttons */
              border-radius: 5px;
            }

            .ProseMirror .original,
            .ProseMirror .delete {
              background-color: rgba(255, 0, 0, 0.5);
              color: rgba(46, 3, 3, 0.8);
            }

            .ProseMirror .updated {
              background-color: rgba(0, 255, 0, 0.5);
              color: rgba(3, 46, 3, 0.8);
            }

            .ProseMirror .insert {
              background-color: rgba(0, 0, 255, 0.5);
              color: rgba(3, 3, 46, 0.8);
            }

            /* Accept button */
            .ProseMirror .original::before,
            .ProseMirror .updated::before,
            .ProseMirror .insert::before,
            .ProseMirror .delete::before {
              content: '✓';
              position: absolute;
              left: 5px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 16px;
              opacity: 0;
              transition: opacity 0.2s;
            }

            /* Reject button */
            .ProseMirror .original::after,
            .ProseMirror .updated::after,
            .ProseMirror .insert::after,
            .ProseMirror .delete::after {
              content: '❌';
              position: absolute;
              left: 30px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 16px;
              opacity: 0;
              transition: opacity 0.2s;
            }

            .ProseMirror .original:hover::before,
            .ProseMirror .original:hover::after,
            .ProseMirror .updated:hover::before,
            .ProseMirror .updated:hover::after,
            .ProseMirror .insert:hover::before,
            .ProseMirror .insert:hover::after,
            .ProseMirror .delete:hover::before,
            .ProseMirror .delete:hover::after {
              opacity: 1;
            }

            /* Action buttons container */
            .ProseMirror-diff-actions {
              position: sticky;
              top: 0;
              background: white;
              padding: 8px;
              border-bottom: 1px solid #ddd;
              z-index: 10;
              display: flex;
              gap: 8px;
            }

            .ProseMirror-diff-button {
              padding: 6px 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              cursor: pointer;
              background: white;
              transition: background-color 0.2s;
            }

            .ProseMirror-diff-button:hover {
              background: #f0f0f0;
            }

            .ProseMirror-diff-accept-all {
              color: #2da44e;
              border-color: #2da44e;
            }

            .ProseMirror-diff-reject-all {
              color: #cf222e;
              border-color: #cf222e;
            }
          `;
          document.head.appendChild(style);

          // Create action buttons
          const actionsContainer = document.createElement("div");
          actionsContainer.className = "ProseMirror-diff-actions";

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
            editorView.dom
          );

          // Function to check if there are any changes and update button visibility
          const updateButtonsVisibility = () => {
            const hasChanges = editorView.dom.querySelector(
              ".original, .updated, .insert, .delete"
            );
            actionsContainer.style.display = hasChanges ? "flex" : "none";
          };

          // Initial check
          updateButtonsVisibility();

          // Update visibility after each transaction
          editorView.state.tr.setMeta("addToHistory", false);
          editorView.dispatch(editorView.state.tr);

          const handleBulkAction = (isAccept: boolean) => {
            const diffElements = Array.from(
              editorView.dom.querySelectorAll(
                ".original, .updated, .insert, .delete"
              )
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
                        editorView.state.schema.text(content)
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
                        editorView.state.schema.text(content)
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
            handleBulkAction(true)
          );
          rejectAllButton.addEventListener("click", () =>
            handleBulkAction(false)
          );

          // Add click handler for delete buttons
          const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const paragraph = target.closest(
              ".original, .updated, .insert, .delete"
            ) as HTMLElement;

            if (!paragraph || event.offsetX > 60) return; // Only handle clicks in button area

            const pos = editorView.posAtDOM(paragraph as Node, 0);
            const resolvedPos = editorView.state.doc.resolve(pos);
            const start = resolvedPos.before();
            const end = resolvedPos.after();
            const content = paragraph.textContent || "";

            const isAcceptButton = event.offsetX <= 25; // First button (accept)
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
                        editorView.state.schema.text(content)
                      )
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
                        editorView.state.schema.text(content)
                      )
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
