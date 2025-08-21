import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const StyleParser = Extension.create({
	name: "styleParser",

	addGlobalAttributes() {
		return [
			{
				types: ["textStyle", "paragraph", "heading", "span", "div"],
				attributes: {
					fullStyle: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (!style) return null;
							// Remove properties handled by dedicated extensions to avoid conflicts
							let cleanedStyle = style
								.replace(/color:\s*[^;]+;?/gi, "")              // Color extension
								.replace(/font-family:\s*[^;]+;?/gi, "")       // FontFamily extension
								.replace(/font-size:\s*[^;]+;?/gi, "")         // FontSize extension
								.replace(/font-weight:\s*[^;]+;?/gi, "")       // StarterKit Bold extension
								.replace(/font-style:\s*[^;]+;?/gi, "")        // StarterKit Italic extension
								.replace(/text-decoration:\s*[^;]+;?/gi, "")   // Underline extension
								.trim();
							return cleanedStyle || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fullStyle) return {};
							return { style: attributes.fullStyle };
						},
					},
				},
			},
		];
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey("styleParser"),
				props: {
					transformPastedHTML(html: string) {
						// Handle full HTML documents by extracting body content
						if (html.includes("<!DOCTYPE") || html.includes("<html")) {
							const tempDiv = document.createElement("div");
							tempDiv.innerHTML = html;
							const bodyContent = tempDiv.querySelector("body");
							if (bodyContent && bodyContent.innerHTML) {
								return bodyContent.innerHTML;
							}
						}

						return html;
					},
				},
			}),
		];
	},
}); 