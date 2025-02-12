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
    
            .ProseMirror .original {
              background-color: rgba(255, 0, 0, 0.5);
              border-radius: 5px;
              color: rgba(46, 3, 3, 0.8);
            }
            .ProseMirror .updated {
              background-color: rgba(0, 255, 0, 0.5);
              border-radius: 5px;
              color: rgba(3, 46, 3, 0.8);
            }
            .ProseMirror .delete {
              background-color: rgba(255, 0, 0, 0.5);
              position: relative;
              padding-left: 30px;  /* Add padding to make room for the button */
              border-radius: 5px;
              color: rgba(46, 3, 3, 0.8);
            }
            .ProseMirror .insert {
              background-color: rgba(0, 0, 255, 0.5);
              border-radius: 5px;
              color: rgba(3, 3, 46, 0.8);
            }
            
            .ProseMirror .delete::before {
              content: '🗑️';
              position: absolute;
              left: 5px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 16px;
              opacity: 0;
              transition: opacity 0.2s;
            }

            .ProseMirror .delete:hover::before {
              opacity: 1;
            }
   
        
          `;
          document.head.appendChild(style);

          // Add click handler for delete buttons
          const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const deleteParagraph = target.closest(".delete");

            // Check if click is in the left padding area (where the button is)
            if (deleteParagraph && event.offsetX <= 30) {
              const pos = editorView.posAtDOM(deleteParagraph as Node, 0);
              const resolvedPos = editorView.state.doc.resolve(pos);
              const start = resolvedPos.before();
              const end = resolvedPos.after();

              const tr = editorView.state.tr.delete(start, end);
              editorView.dispatch(tr);
            }
          };

          editorView.dom.addEventListener("click", handleClick);

          return {
            destroy: () => {
              // Clean up styles and event listeners when editor is destroyed
              const styleElement = document.getElementById("diff-style");
              if (styleElement) {
                styleElement.remove();
              }
              editorView.dom.removeEventListener("click", handleClick);
            },
          };
        },
      }),
    ];
  },
});
