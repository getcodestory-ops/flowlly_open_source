import type { OutputBlockData } from "@editorjs/editorjs";

export const jsonToHtml = (jsonData: OutputBlockData[]) => {
	const convertNode = (node: OutputBlockData) => {
		switch (node.type) {
			case "header":
				return `<h${node.data.level}>${node.data.text}</h${node.data.level}>`;
			case "paragraph":
				return `${node.data.text}`;
			case "list":
				const listItems = node.data.items
					.map((item: any) => `<li>${item}</li>`)
					.join("");
				return node.data.style === "ordered"
					? `<ol>${listItems}</ol>`
					: `<ul>${listItems}</ul>`;
			case "simpleImage":
				return `<img src="${node.data.url}" alt="${node.data.caption}" />`;
			default:
				console.warn(`Unknown node type: ${node.type}`);
				return "";
		}
	};

	return jsonData.map((node: OutputBlockData) => convertNode(node)).join("\n");
};
