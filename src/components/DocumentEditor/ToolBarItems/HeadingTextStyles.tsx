import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { type Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface HeadingTextStylesProps {
	editor: Editor;
}

const labelMap: Record<string, string> = {
	p: "Paragraph",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	h4: "Heading 4",
	h5: "Heading 5",
	h6: "Heading 6",
	none: "Normal Text",
	primary: "Primary Blue",
	success: "Success Green",
	warning: "Warning Orange",
	danger: "Danger Red",
	muted: "Muted Gray",
	"construction-note": "Construction Note",
	"project-milestone": "Project Milestone",
	"task-priority-high": "High Priority",
	"task-priority-medium": "Medium Priority",
	"task-priority-low": "Low Priority",
};

const getEditorStyleValue = (editor: Editor): string => {
	if (editor.isActive("heading", { level: 1 })) return "h1";
	if (editor.isActive("heading", { level: 2 })) return "h2";
	if (editor.isActive("heading", { level: 3 })) return "h3";
	if (editor.isActive("heading", { level: 4 })) return "h4";
	if (editor.isActive("heading", { level: 5 })) return "h5";
	if (editor.isActive("heading", { level: 6 })) return "h6";

	const colorAttr = editor.getAttributes("textStyle").color;
	switch (colorAttr) {
		case "#2563eb": return "primary";
		case "#16a34a": return "success";
		case "#ea580c": return "warning";
		case "#dc2626": return "danger";
		case "#6b7280": return "muted";
		case "#f59e0b": return "construction-note";
		case "#7c3aed": return "project-milestone";
		default: return "p";
	}
};

const HeadingTextStyles: React.FC<HeadingTextStylesProps> = ({ editor }) => {
	const currentValue = getEditorStyleValue(editor);

	const applyStyle = (value: string) => {
		if (value === "p") {
			editor.chain().focus()
				.setParagraph()
				.unsetMark("textStyle")
				.run();
		} else if (value.startsWith("h")) {
			const level = parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
			editor.chain().focus()
				.setHeading({ level })
				.unsetMark("textStyle")
				.run();
		} else if (value === "none") {
			editor.chain().focus()
				.unsetMark("textStyle")
				.unsetColor()
				.run();
		} else {
			const styleMap: Record<string, { color: string }> = {
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

			const styles = styleMap[value];
			if (styles) {
				editor.chain().focus()
					.setColor(styles.color)
					.run();
			}
		}
	};

	const structureItems = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];
	const textStyleItems = [
		"none", "primary", "success", "warning", "danger", "muted",
		"construction-note", "project-milestone",
		"task-priority-high", "task-priority-medium", "task-priority-low",
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className="flex h-9 w-28 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
				>
					<span className="line-clamp-1">{labelMap[currentValue] ?? "Style"}</span>
					<ChevronDownIcon className="h-4 w-4 opacity-50" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-48 max-h-96 overflow-y-auto">
				<DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
					Structure
				</DropdownMenuLabel>
				<DropdownMenuGroup>
					{structureItems.map((item) => (
						<DropdownMenuItem
							key={item}
							className={cn(currentValue === item && "bg-accent")}
							onSelect={() => applyStyle(item)}
						>
							{labelMap[item]}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
					Text Styles
				</DropdownMenuLabel>
				<DropdownMenuGroup>
					{textStyleItems.map((item) => (
						<DropdownMenuItem
							key={item}
							className={cn(currentValue === item && "bg-accent")}
							onSelect={() => applyStyle(item)}
						>
							{labelMap[item]}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default HeadingTextStyles;
