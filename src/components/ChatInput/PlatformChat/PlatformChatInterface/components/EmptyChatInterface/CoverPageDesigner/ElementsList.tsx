import React from "react";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Trash2 } from "lucide-react";
import type { CoverElement } from "./types";

interface ElementsListProps {
	elements: CoverElement[];
	selectedElementId: string | null;
	onElementSelect: (id: string) => void;
	onElementDelete: (id: string) => void;
}

export default function ElementsList({
	elements,
	selectedElementId,
	onElementSelect,
	onElementDelete,
}: ElementsListProps): React.JSX.Element | null {
	if (elements.length === 0) {
		return null;
	}

	return (
		<div>
			<h4 className="text-lg font-semibold mb-4">Elements ({elements.length})</h4>
			<div className="space-y-2">
				{elements
					.sort((a, b) => b.zIndex - a.zIndex)
					.map((element, index) => (
						<div
							className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
								selectedElementId === element.id ? "bg-blue-50 border-blue-300" : "bg-gray-50 hover:bg-gray-100"
							}`}
							key={element.id}
							onClick={() => onElementSelect(element.id)}
						>
							<div className="flex items-center gap-3">
								{element.type === "text" && <Type size={16} />}
								{(element.type === "image" || element.type === "logo") && <ImageIcon size={16} />}
								<div>
									<div className="font-medium text-sm">
										{element.type === "text" 
											? (element.text || "Text").substring(0, 30) + (element.text && element.text.length > 30 ? "..." : "")
											: `${element.type} ${index + 1}`
										}
									</div>
									<div className="text-xs text-gray-500">
										{Math.round(element.x)}%, {Math.round(element.y)}% • {Math.round(element.width)} × {Math.round(element.height)}%
									</div>
								</div>
							</div>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									onElementDelete(element.id);
								}}
								size="sm"
								variant="ghost"
							>
								<Trash2 size={14} />
							</Button>
						</div>
					))
				}
			</div>
		</div>
	);
}
