
import { Mark } from "@tiptap/core";


const CustomHighlight = Mark.create({
	name: "customHighlight",
});

export default CustomHighlight.extend({
	/**
     * @return {{markdown: MarkdownMarkSpec}}
     */
	addStorage() {
		return {
			markdown: {
				serialize: [
					{ open: "++", close: "++", expelEnclosingWhitespace: true },
					{ open: "--", close: "--", expelEnclosingWhitespace: true },
				],
				parse: {
					updateDOM(element: HTMLElement) {
						element.innerHTML = element.innerHTML.replace(/\+\+(.*?)\+\+/g, "<mark class='insert' data-color='#8ce99a'>$1</mark>");
						element.innerHTML = element.innerHTML.replace(/--(.*?)--/g, "<mark class='delete' data-color='#f98181'>$1</mark>");
					},
				},
			},
		};
	},
});