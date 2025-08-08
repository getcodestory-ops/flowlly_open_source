import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const StyleParser = Extension.create({
	name: "styleParser",

	addGlobalAttributes() {
		return [
			{
				types: ["textStyle", "paragraph", "heading", "span", "div"],
				attributes: {
					// Handle individual style properties
					color: {
						default: null,
						parseHTML: (element) => {
							// First check for color property in style attribute
							const style = element.getAttribute("style");
							if (style) {
								const colorMatch = style.match(/color:\s*([^;]+)/);
								if (colorMatch) {
									return colorMatch[1].trim();
								}
							}
							// Fallback to individual style property
							return element.style.color || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.color) return {};
							return { style: `color: ${attributes.color}` };
						},
					},
					fontFamily: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (style) {
								const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/);
								if (fontFamilyMatch) {
									return fontFamilyMatch[1].trim().replace(/['"]/g, "");
								}
							}
							return element.style.fontFamily || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fontFamily) return {};
							return { style: `font-family: ${attributes.fontFamily}` };
						},
					},
					fontSize: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (style) {
								const fontSizeMatch = style.match(/font-size:\s*([^;]+)/);
								if (fontSizeMatch) {
									return fontSizeMatch[1].trim();
								}
							}
							return element.style.fontSize || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fontSize) return {};
							return { style: `font-size: ${attributes.fontSize}` };
						},
					},
					fontWeight: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (style) {
								const fontWeightMatch = style.match(/font-weight:\s*([^;]+)/);
								if (fontWeightMatch) {
									return fontWeightMatch[1].trim();
								}
							}
							return element.style.fontWeight || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fontWeight) return {};
							return { style: `font-weight: ${attributes.fontWeight}` };
						},
					},
					fontStyle: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (style) {
								const fontStyleMatch = style.match(/font-style:\s*([^;]+)/);
								if (fontStyleMatch) {
									return fontStyleMatch[1].trim();
								}
							}
							return element.style.fontStyle || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fontStyle) return {};
							return { style: `font-style: ${attributes.fontStyle}` };
						},
					},
					textDecoration: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							if (style) {
								const textDecorationMatch = style.match(/text-decoration:\s*([^;]+)/);
								if (textDecorationMatch) {
									return textDecorationMatch[1].trim();
								}
							}
							return element.style.textDecoration || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.textDecoration) return {};
							return { style: `text-decoration: ${attributes.textDecoration}` };
						},
					},
					// Preserve complete style attribute for any unhandled CSS properties
					fullStyle: {
						default: null,
						parseHTML: (element) => {
							const style = element.getAttribute("style");
							return style || null;
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
						// Convert named colors to hex values for better compatibility
						const colorMap: Record<string, string> = {
							red: "#ff0000",
							green: "#008000",
							blue: "#0000ff",
							yellow: "#ffff00",
							orange: "#ffa500",
							purple: "#800080",
							pink: "#ffc0cb",
							brown: "#a52a2a",
							gray: "#808080",
							grey: "#808080",
							black: "#000000",
							white: "#ffffff",
							cyan: "#00ffff",
							magenta: "#ff00ff",
							lime: "#00ff00",
							maroon: "#800000",
							navy: "#000080",
							olive: "#808000",
							silver: "#c0c0c0",
							teal: "#008080",
						};

						let processedHtml = html;

						// Replace named colors with hex values
						Object.entries(colorMap).forEach(([name, hex]) => {
							const regex = new RegExp(`color:\\s*${name}\\b`, "gi");
							processedHtml = processedHtml.replace(regex, `color: ${hex}`);
						});

						// Handle full HTML documents by extracting body content
						if (processedHtml.includes("<!DOCTYPE") || processedHtml.includes("<html")) {
							const tempDiv = document.createElement("div");
							tempDiv.innerHTML = processedHtml;
							const bodyContent = tempDiv.querySelector("body");
							if (bodyContent && bodyContent.innerHTML) {
								return bodyContent.innerHTML;
							}
						}

						return processedHtml;
					},
				},
			}),
		];
	},
}); 