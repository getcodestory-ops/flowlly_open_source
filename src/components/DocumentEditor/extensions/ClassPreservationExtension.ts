import { Extension } from "@tiptap/core";
import { mergeAttributes } from "@tiptap/core";

/**
 * Extension to preserve class attributes and other HTML attributes when using getHTML()
 * This ensures that class names, data attributes, and other HTML attributes are maintained
 * during document serialization and deserialization.
 */
export const ClassPreservationExtension = Extension.create({
	name: "classPreservation",

	addGlobalAttributes() {
		return [
			{
				// Apply to all node types that can have class attributes
				types: [
					"paragraph",
					"heading", 
					"div",
					"span",
					"blockquote",
					"codeBlock",
					"listItem",
					"bulletList",
					"orderedList",
					"table",
					"tableRow",
					"tableHeader",
					"tableCell",
					"image",
					"link",
					"textStyle",
				],
				attributes: {
					// Preserve class attribute
					class: {
						default: null,
						parseHTML: (element) => {
							const className = element.getAttribute("class");
							return className || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.class) return {};
							return { class: attributes.class };
						},
					},
					// Preserve data attributes
					dataAttributes: {
						default: null,
						parseHTML: (element) => {
							const dataAttrs: Record<string, string> = {};
							Array.from(element.attributes).forEach((attr) => {
								if (attr.name.startsWith("data-")) {
									dataAttrs[attr.name] = attr.value;
								}
							});
							return Object.keys(dataAttrs).length > 0 ? dataAttrs : null;
						},
						renderHTML: (attributes) => {
							if (!attributes.dataAttributes) return {};
							return attributes.dataAttributes;
						},
					},
					// Preserve id attribute
					id: {
						default: null,
						parseHTML: (element) => {
							const id = element.getAttribute("id");
							return id || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.id) return {};
							return { id: attributes.id };
						},
					},
					// Preserve title attribute
					title: {
						default: null,
						parseHTML: (element) => {
							const title = element.getAttribute("title");
							return title || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.title) return {};
							return { title: attributes.title };
						},
					},
					// Preserve role attribute (for accessibility)
					role: {
						default: null,
						parseHTML: (element) => {
							const role = element.getAttribute("role");
							return role || null;
						},
						renderHTML: (attributes) => {
							if (!attributes.role) return {};
							return { role: attributes.role };
						},
					},
					// Preserve aria attributes (for accessibility)
					ariaAttributes: {
						default: null,
						parseHTML: (element) => {
							const ariaAttrs: Record<string, string> = {};
							Array.from(element.attributes).forEach((attr) => {
								if (attr.name.startsWith("aria-")) {
									ariaAttrs[attr.name] = attr.value;
								}
							});
							return Object.keys(ariaAttrs).length > 0 ? ariaAttrs : null;
						},
						renderHTML: (attributes) => {
							if (!attributes.ariaAttributes) return {};
							return attributes.ariaAttributes;
						},
					},
				},
			},
		];
	},

	/**
	 * Add a prosemirror plugin to handle complex HTML preservation scenarios
	 */
	addProseMirrorPlugins() {
		return [];
	},
});

export default ClassPreservationExtension;
