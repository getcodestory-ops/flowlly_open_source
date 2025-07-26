import React from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Editor } from "@tiptap/react";

interface HeadingTextStylesProps {
	editor: Editor;
}

const HeadingTextStyles: React.FC<HeadingTextStylesProps> = ({ editor }) => {
	return (
		<Select
			onValueChange={(value) => {
				// Handle heading changes
				if (value === "p") {
					editor.chain().focus()
						.setParagraph()
						.unsetMark("textStyle")
						.run();
				} else if (value.startsWith("h")) {
					const level = parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
					editor.chain().focus()
						.toggleHeading({ level })
						.unsetMark("textStyle")
						.run();
				} else if (value === "none") {
					// Remove all custom styles but keep current paragraph/heading
					editor.chain().focus()
						.unsetMark("textStyle")
						.unsetColor()
						.run();
				} else {
					// Apply inline styles based on selection
					const styleMap = {
						primary: { color: "#2563eb" },
						success: { color: "#16a34a" },
						warning: { color: "#ea580c" },
						danger: { color: "#dc2626" },
						muted: { color: "#6b7280" },
						"construction-note": { color: "#f59e0b" },
						"project-milestone": { color: "#7c3aed" },
						"task-priority-high": { color: "#dc2626" },
						"task-priority-medium": { color: "#ea580c" },
						"task-priority-low": { color: "#16a34a" },
					};
					
					const styles = styleMap[value as keyof typeof styleMap];
					if (styles) {
						editor.chain().focus()
							.setColor(styles.color)
							.run();
					}
				}
			}}
			value={
				editor.isActive("heading", { level: 1 }) ? "h1" 
					: editor.isActive("heading", { level: 2 }) ? "h2" 
						: editor.isActive("heading", { level: 3 }) ? "h3" 
							: editor.isActive("heading", { level: 4 }) ? "h4"
								: editor.isActive("heading", { level: 5 }) ? "h5"
									: editor.isActive("heading", { level: 6 }) ? "h6"
										: (() => {
											const colorAttr = editor.getAttributes("textStyle").color;
											
											// Check for color-based styles
											switch (colorAttr) {
												case "#2563eb": return "primary";
												case "#16a34a": 
													// Could be success or task-priority-low, just default to success
													return "success";
												case "#ea580c": 
													// Could be warning or task-priority-medium, just default to warning
													return "warning";
												case "#dc2626": 
													// Could be danger or task-priority-high, just default to danger
													return "danger";
												case "#6b7280": return "muted";
												case "#f59e0b": return "construction-note";
												case "#7c3aed": return "project-milestone";
												default: return "p";
											}
										})()
			}
		>
			<SelectTrigger className="w-28">
				<SelectValue placeholder="Style" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Structure</div>
					<SelectItem value="p">Paragraph</SelectItem>
					<SelectItem value="h1">Heading 1</SelectItem>
					<SelectItem value="h2">Heading 2</SelectItem>
					<SelectItem value="h3">Heading 3</SelectItem>
					<SelectItem value="h4">Heading 4</SelectItem>
					<SelectItem value="h5">Heading 5</SelectItem>
					<SelectItem value="h6">Heading 6</SelectItem>
				</SelectGroup>
				<SelectGroup>
					<div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Text Styles</div>
					<SelectItem value="none">Normal Text</SelectItem>
					<SelectItem value="primary">Primary Blue</SelectItem>
					<SelectItem value="success">Success Green</SelectItem>
					<SelectItem value="warning">Warning Orange</SelectItem>
					<SelectItem value="danger">Danger Red</SelectItem>
					<SelectItem value="muted">Muted Gray</SelectItem>
					<SelectItem value="construction-note">Construction Note</SelectItem>
					<SelectItem value="project-milestone">Project Milestone</SelectItem>
					<SelectItem value="task-priority-high">High Priority</SelectItem>
					<SelectItem value="task-priority-medium">Medium Priority</SelectItem>
					<SelectItem value="task-priority-low">Low Priority</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default HeadingTextStyles; 