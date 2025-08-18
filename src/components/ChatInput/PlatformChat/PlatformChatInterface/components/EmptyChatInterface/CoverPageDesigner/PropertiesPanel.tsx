import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { 
	Copy, 
	Trash2, 
	AlignLeft,
	AlignCenter,
	AlignRight,
	Bold,
	Italic,
	Underline,
} from "lucide-react";
import type { CoverElement } from "./types";

interface PropertiesPanelProps {
	selectedElement: CoverElement | null;
	onElementUpdate: (id: string, updates: Partial<CoverElement>) => void;
	onElementDuplicate: (id: string) => void;
	onElementDelete: (id: string) => void;
	onElementZChange: (id: string, direction: "front" | "back") => void;
}

export default function PropertiesPanel({
	selectedElement,
	onElementUpdate,
	onElementDuplicate,
	onElementDelete,
	onElementZChange,
}: PropertiesPanelProps): React.JSX.Element {
	if (!selectedElement) {
		return (
			<div className="text-center py-8 text-gray-500">
				<p>Select an element to edit its properties</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with actions */}
			<div className="flex items-center justify-between">
				<h4 className="font-medium">Element Properties</h4>
				<div className="flex gap-1">
					<Button
						onClick={() => onElementDuplicate(selectedElement.id)}
						size="sm"
						title="Duplicate"
						variant="outline"
					>
						<Copy size={14} />
					</Button>
					<Button
						onClick={() => onElementZChange(selectedElement.id, "front")}
						size="sm"
						title="Bring to Front"
						variant="outline"
					>
						↑
					</Button>
					<Button
						onClick={() => onElementZChange(selectedElement.id, "back")}
						size="sm"
						title="Send to Back"
						variant="outline"
					>
						↓
					</Button>
					<Button
						onClick={() => onElementDelete(selectedElement.id)}
						size="sm"
						title="Delete"
						variant="outline"
					>
						<Trash2 size={14} />
					</Button>
				</div>
			</div>

			{/* Position and Size */}
			<div className="grid grid-cols-2 gap-2">
				<div>
					<Label className="text-xs">X Position (%)</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { x: Number(e.target.value) })}
						type="number"
						value={Math.round(selectedElement.x)}
					/>
				</div>
				<div>
					<Label className="text-xs">Y Position (%)</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { y: Number(e.target.value) })}
						type="number"
						value={Math.round(selectedElement.y)}
					/>
				</div>
				<div>
					<Label className="text-xs">Width (%)</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { width: Number(e.target.value) })}
						type="number"
						value={Math.round(selectedElement.width)}
					/>
				</div>
				<div>
					<Label className="text-xs">Height (%)</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { height: Number(e.target.value) })}
						type="number"
						value={Math.round(selectedElement.height)}
					/>
				</div>
			</div>

			{/* Text-specific properties */}
			{selectedElement.type === "text" && (
				<>
					<div>
						<Label className="text-xs">Text Content</Label>
						<Textarea
							className="h-16 text-sm"
							onChange={(e) => onElementUpdate(selectedElement.id, { text: e.target.value })}
							value={selectedElement.text || ""}
						/>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<div>
							<Label className="text-xs">Font Size</Label>
							<Input
								className="h-8"
								onChange={(e) => onElementUpdate(selectedElement.id, { fontSize: Number(e.target.value) })}
								type="number"
								value={selectedElement.fontSize || 16}
							/>
						</div>
						<div>
							<Label className="text-xs">Color</Label>
							<div className="flex gap-1">
								<Input
									className="h-8 w-16 p-1"
									onChange={(e) => onElementUpdate(selectedElement.id, { color: e.target.value })}
									type="color"
									value={selectedElement.color || "#000000"}
								/>
								<Input
									className="h-8 flex-1"
									onChange={(e) => onElementUpdate(selectedElement.id, { color: e.target.value })}
									value={selectedElement.color || "#000000"}
								/>
							</div>
						</div>
					</div>
					<div>
						<Label className="text-xs">Font Family</Label>
						<Select
							onValueChange={(value) => onElementUpdate(selectedElement.id, { fontFamily: value })}
							value={selectedElement.fontFamily || "Arial, sans-serif"}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Arial, sans-serif">Arial</SelectItem>
								<SelectItem value="Georgia, serif">Georgia</SelectItem>
								<SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
								<SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
								<SelectItem value="'Courier New', monospace">Courier New</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { 
								fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold", 
							})}
							size="sm"
							variant={selectedElement.fontWeight === "bold" ? "default" : "outline"}
						>
							<Bold size={14} />
						</Button>
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { 
								fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic", 
							})}
							size="sm"
							variant={selectedElement.fontStyle === "italic" ? "default" : "outline"}
						>
							<Italic size={14} />
						</Button>
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { 
								textDecoration: selectedElement.textDecoration === "underline" ? "none" : "underline", 
							})}
							size="sm"
							variant={selectedElement.textDecoration === "underline" ? "default" : "outline"}
						>
							<Underline size={14} />
						</Button>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { textAlign: "left" })}
							size="sm"
							variant={selectedElement.textAlign === "left" ? "default" : "outline"}
						>
							<AlignLeft size={14} />
						</Button>
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { textAlign: "center" })}
							size="sm"
							variant={selectedElement.textAlign === "center" ? "default" : "outline"}
						>
							<AlignCenter size={14} />
						</Button>
						<Button
							onClick={() => onElementUpdate(selectedElement.id, { textAlign: "right" })}
							size="sm"
							variant={selectedElement.textAlign === "right" ? "default" : "outline"}
						>
							<AlignRight size={14} />
						</Button>
					</div>
				</>
			)}

			{/* Image-specific properties */}
			{(selectedElement.type === "image" || selectedElement.type === "logo") && (
				<>
					<div>
						<Label className="text-xs">Image URL</Label>
						<Input
							className="h-8"
							onChange={(e) => onElementUpdate(selectedElement.id, { src: e.target.value })}
							placeholder="https://example.com/image.jpg"
							value={selectedElement.src || ""}
						/>
					</div>
					<div>
						<Label className="text-xs">Alt Text</Label>
						<Input
							className="h-8"
							onChange={(e) => onElementUpdate(selectedElement.id, { alt: e.target.value })}
							value={selectedElement.alt || ""}
						/>
					</div>
					<div>
						<Label className="text-xs">Object Fit</Label>
						<Select
							onValueChange={(value: "contain" | "cover" | "fill") => 
								onElementUpdate(selectedElement.id, { objectFit: value })
							}
							value={selectedElement.objectFit || "contain"}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="contain">Contain (fit within)</SelectItem>
								<SelectItem value="cover">Cover (fill, may crop)</SelectItem>
								<SelectItem value="fill">Fill (stretch to fit)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</>
			)}

			{/* Common styling properties */}
			<div>
				<Label className="text-xs">Background Color</Label>
				<div className="flex gap-1">
					<Input
						className="h-8 w-16 p-1"
						onChange={(e) => onElementUpdate(selectedElement.id, { backgroundColor: e.target.value })}
						type="color"
						value={selectedElement.backgroundColor || "#ffffff"}
					/>
					<Input
						className="h-8 flex-1"
						onChange={(e) => onElementUpdate(selectedElement.id, { backgroundColor: e.target.value })}
						placeholder="transparent"
						value={selectedElement.backgroundColor || ""}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<div>
					<Label className="text-xs">Border Width</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { borderWidth: Number(e.target.value) })}
						type="number"
						value={selectedElement.borderWidth || 0}
					/>
				</div>
				<div>
					<Label className="text-xs">Border Radius</Label>
					<Input
						className="h-8"
						onChange={(e) => onElementUpdate(selectedElement.id, { borderRadius: Number(e.target.value) })}
						type="number"
						value={selectedElement.borderRadius || 0}
					/>
				</div>
			</div>

			{selectedElement.borderWidth && selectedElement.borderWidth > 0 && (
				<div>
					<Label className="text-xs">Border Color</Label>
					<div className="flex gap-1">
						<Input
							className="h-8 w-16 p-1"
							onChange={(e) => onElementUpdate(selectedElement.id, { borderColor: e.target.value })}
							type="color"
							value={selectedElement.borderColor || "#cccccc"}
						/>
						<Input
							className="h-8 flex-1"
							onChange={(e) => onElementUpdate(selectedElement.id, { borderColor: e.target.value })}
							value={selectedElement.borderColor || "#cccccc"}
						/>
					</div>
				</div>
			)}

			<div>
				<Label className="text-xs">Opacity</Label>
				<Input
					className="h-8"
					max="1"
					min="0"
					onChange={(e) => onElementUpdate(selectedElement.id, { opacity: Number(e.target.value) })}
					step="0.1"
					type="range"
					value={selectedElement.opacity || 1}
				/>
			</div>

			<div>
				<Label className="text-xs">Rotation (degrees)</Label>
				<Input
					className="h-8"
					onChange={(e) => onElementUpdate(selectedElement.id, { rotation: Number(e.target.value) })}
					type="number"
					value={selectedElement.rotation || 0}
				/>
			</div>
		</div>
	);
}
