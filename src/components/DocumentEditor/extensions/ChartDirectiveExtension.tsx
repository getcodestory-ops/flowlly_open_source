import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export interface ChartDirectiveOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chartDirective: {
      /**
       * Insert a chart directive
       */
      insertChartDirective: (data: string) => ReturnType;
    };
  }
}

export const ChartDirectiveExtension = Extension.create<ChartDirectiveOptions>({
	name: "chartDirective",

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addCommands() {
		return {
			insertChartDirective:
        (data: string) =>
        	({ commands }) => {
        		return commands.insertContent({
        			type: "chart",
        			attrs: { data },
        		});
        	},
		};
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("chartDirective"),
				props: {
					decorations: (state) => {
						const decorations: Decoration[] = [];
						const doc = state.doc;

						doc.descendants((node, pos) => {
							if (node.type.name === "paragraph") {
								const text = node.textContent;
                
								// Match chart directive pattern: :::chart\n{data}\n:::
								const directiveRegex = /:::chart\s*\n([\s\S]*?)\n:::/g;
								let match;

								while ((match = directiveRegex.exec(text)) !== null) {
									const from = pos + 1 + match.index;
									const to = from + match[0].length;
                  
									decorations.push(
										Decoration.inline(from, to, {
											class: "chart-directive-highlight",
											style: "background-color: #e3f2fd; border-radius: 4px; padding: 2px;",
										}),
									);
								}
							}
						});

						return DecorationSet.create(doc, decorations);
					},
				},
			}),
		];
	},

	addKeyboardShortcuts() {
		return {
			"Mod-Shift-c": () => {
				// Insert a sample chart directive
				const sampleData = JSON.stringify({
					type: "line",
					title: "Sample Chart",
					elements: [
						{
							label: "Sample Line",
							points: [[0, 0], [1, 1], [2, 4], [3, 9]],
						},
					],
					x_label: "X-axis",
					y_label: "Y-axis",
				});

				return this.editor.commands.insertContent(`:::chart\n${sampleData}\n:::`);
			},
		};
	},
}); 