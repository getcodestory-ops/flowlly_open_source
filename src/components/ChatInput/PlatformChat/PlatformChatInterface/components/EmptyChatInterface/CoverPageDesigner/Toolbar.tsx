import React from "react";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon } from "lucide-react";
import type { CoverElement } from "./types";

interface ToolbarProps {
	onAddElement: (type: CoverElement["type"]) => void;
}

export default function Toolbar({ onAddElement }: ToolbarProps): React.JSX.Element {
	return (
		<div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
			<Button
				className="flex items-center gap-2"
				onClick={() => onAddElement("text")}
				size="sm"
			>
				<Type size={16} />
				Add Text
			</Button>
			<Button
				className="flex items-center gap-2"
				onClick={() => onAddElement("image")}
				size="sm"
				variant="outline"
			>
				<ImageIcon size={16} />
				Add Image
			</Button>
			<Button
				className="flex items-center gap-2"
				onClick={() => onAddElement("logo")}
				size="sm"
				variant="outline"
			>
				<ImageIcon size={16} />
				Add Logo
			</Button>
		</div>
	);
}
