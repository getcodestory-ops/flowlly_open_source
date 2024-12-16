import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export const HoverExtension = Extension.create({
  name: "hover",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          "data-tooltip": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-tooltip"),
            renderHTML: (attributes) => {
              if (!attributes["data-tooltip"]) {
                return {};
              }
              return {
                "data-tooltip": attributes["data-tooltip"],
              };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    let tooltipTimeout: number | null = null;

    return [
      new Plugin({
        key: new PluginKey("hover"),
        view: (editorView: EditorView) => {
          return {
            update: (view, prevState) => {
              // Handle updates if needed
            },
            destroy: () => {
              // Clean up tooltip when editor is destroyed
              const tooltip = document.getElementById("hover-tooltip");
              if (tooltip) {
                tooltip.remove();
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              if (tooltipTimeout) {
                window.clearTimeout(tooltipTimeout);
              }

              tooltipTimeout = window.setTimeout(() => {
                const target = event.target as HTMLElement;
                const hoverElement = target.closest("[data-tooltip]");

                if (hoverElement) {
                  const tooltipContent =
                    hoverElement.getAttribute("data-tooltip");

                  let tooltip = document.getElementById("hover-tooltip");
                  if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.id = "hover-tooltip";
                    tooltip.className = "hover-tooltip";
                    tooltip.style.cssText = `
                      position: fixed;
                      padding: 8px 12px;
                      background: rgba(0, 0, 0, 0.8);
                      color: white;
                      border-radius: 4px;
                      font-size: 14px;
                      z-index: 10000;
                      pointer-events: none;
                    `;
                    document.body.appendChild(tooltip);
                  }

                  tooltip.textContent = tooltipContent || "";
                  tooltip.style.display = "block";

                  const bounds = hoverElement.getBoundingClientRect();
                  const tooltipBounds = tooltip.getBoundingClientRect();

                  let top = bounds.top - tooltipBounds.height - 8;
                  let left =
                    bounds.left + (bounds.width - tooltipBounds.width) / 2;

                  if (top < 0) {
                    top = bounds.bottom + 8;
                  }
                  if (left < 0) {
                    left = 8;
                  } else if (left + tooltipBounds.width > window.innerWidth) {
                    left = window.innerWidth - tooltipBounds.width - 8;
                  }

                  tooltip.style.left = `${left}px`;
                  tooltip.style.top = `${top}px`;
                } else {
                  const tooltip = document.getElementById("hover-tooltip");
                  if (tooltip) {
                    tooltip.style.display = "none";
                  }
                }
              }, 20);

              return false;
            },
            mouseout(view, event) {
              const tooltip = document.getElementById("hover-tooltip");
              if (tooltip) {
                tooltip.style.display = "none";
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
