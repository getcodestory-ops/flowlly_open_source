import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

// Margin box content types
export type ContentType = "text" | "page-counter" | "page-counter-total" | "running-header" | "image" | "none";

export interface MarginBoxConfig {
	type: ContentType;
	content: string;
	runningSelector?: string; // For running headers
}

interface MarginBoxInterfaceProps {
	marginBoxes: Record<string, MarginBoxConfig>;
	selectedMarginBox: string | null;
	onMarginBoxSelect: (boxName: string) => void;
	onMarginBoxUpdate: (boxName: string, updates: Partial<MarginBoxConfig>) => void;
}

// Helper function to get margin box display names
const getMarginBoxDisplayName = (boxName: string): string => {
	const names: Record<string, string> = {
		"top-left-corner": "Top Left Corner",
		"top-left": "Top Left",
		"top-center": "Top Center",
		"top-right": "Top Right",
		"top-right-corner": "Top Right Corner",
		"left-top": "Left Top",
		"left-middle": "Left Middle",
		"left-bottom": "Left Bottom",
		"right-top": "Right Top",
		"right-middle": "Right Middle",
		"right-bottom": "Right Bottom",
		"bottom-left-corner": "Bottom Left Corner",
		"bottom-left": "Bottom Left",
		"bottom-center": "Bottom Center",
		"bottom-right": "Bottom Right",
		"bottom-right-corner": "Bottom Right Corner",
	};
	return names[boxName] || boxName;
};

// Render margin box button
const MarginBoxButton: React.FC<{
	boxName: string;
	abbreviation: string;
	title: string;
	className: string;
	style?: React.CSSProperties;
	isSelected: boolean;
	hasContent: boolean;
	onClick: () => void;
}> = ({ abbreviation, title, className, style, isSelected, hasContent, onClick }) => (
	<button
		className={`${className} border border-gray-400 rounded text-xs bg-gray-50 hover:bg-blue-50 transition-colors ${
			isSelected ? "ring-2 ring-blue-500 bg-blue-100" : ""
		} ${hasContent ? "bg-green-100" : ""}`}
		onClick={onClick}
		style={style}
		title={title}
	>
		{abbreviation}
	</button>
);

// Render the interactive page layout
const PageLayout: React.FC<{
	marginBoxes: Record<string, MarginBoxConfig>;
	selectedMarginBox: string | null;
	onMarginBoxSelect: (boxName: string) => void;
}> = ({ marginBoxes, selectedMarginBox, onMarginBoxSelect }) => (
	<div className="relative w-full max-w-md mx-auto">
		{/* Page representation */}
		<div className="relative bg-white border-2 border-gray-300 rounded-lg" style={{ aspectRatio: "210/297" }}>
			{/* Corner margin boxes */}
			<MarginBoxButton
				abbreviation="TLC"
				boxName="top-left-corner"
				className="absolute w-12 h-8"
				hasContent={marginBoxes["top-left-corner"].type !== "none"}
				isSelected={selectedMarginBox === "top-left-corner"}
				onClick={() => onMarginBoxSelect("top-left-corner")}
				style={{ top: "-16px", left: "-16px" }}
				title="Top Left Corner"
			/>
			<MarginBoxButton
				abbreviation="TRC"
				boxName="top-right-corner"
				className="absolute w-12 h-8"
				hasContent={marginBoxes["top-right-corner"].type !== "none"}
				isSelected={selectedMarginBox === "top-right-corner"}
				onClick={() => onMarginBoxSelect("top-right-corner")}
				style={{ top: "-16px", right: "-16px" }}
				title="Top Right Corner"
			/>
			<MarginBoxButton
				abbreviation="BLC"
				boxName="bottom-left-corner"
				className="absolute w-12 h-8"
				hasContent={marginBoxes["bottom-left-corner"].type !== "none"}
				isSelected={selectedMarginBox === "bottom-left-corner"}
				onClick={() => onMarginBoxSelect("bottom-left-corner")}
				style={{ bottom: "-16px", left: "-16px" }}
				title="Bottom Left Corner"
			/>
			<MarginBoxButton
				abbreviation="BRC"
				boxName="bottom-right-corner"
				className="absolute w-12 h-8"
				hasContent={marginBoxes["bottom-right-corner"].type !== "none"}
				isSelected={selectedMarginBox === "bottom-right-corner"}
				onClick={() => onMarginBoxSelect("bottom-right-corner")}
				style={{ bottom: "-16px", right: "-16px" }}
				title="Bottom Right Corner"
			/>
			<div className="absolute flex" style={{ top: "-16px", left: "48px", right: "48px", height: "32px" }}>
				<MarginBoxButton
					abbreviation="TL"
					boxName="top-left"
					className="flex-1 mx-1"
					hasContent={marginBoxes["top-left"].type !== "none"}
					isSelected={selectedMarginBox === "top-left"}
					onClick={() => onMarginBoxSelect("top-left")}
					title="Top Left"
				/>
				<MarginBoxButton
					abbreviation="TC"
					boxName="top-center"
					className="flex-1 mx-1"
					hasContent={marginBoxes["top-center"].type !== "none"}
					isSelected={selectedMarginBox === "top-center"}
					onClick={() => onMarginBoxSelect("top-center")}
					title="Top Center"
				/>
				<MarginBoxButton
					abbreviation="TR"
					boxName="top-right"
					className="flex-1 mx-1"
					hasContent={marginBoxes["top-right"].type !== "none"}
					isSelected={selectedMarginBox === "top-right"}
					onClick={() => onMarginBoxSelect("top-right")}
					title="Top Right"
				/>
			</div>
			<div className="absolute flex" style={{ bottom: "-16px", left: "48px", right: "48px", height: "32px" }}>
				<MarginBoxButton
					abbreviation="BL"
					boxName="bottom-left"
					className="flex-1 mx-1"
					hasContent={marginBoxes["bottom-left"].type !== "none"}
					isSelected={selectedMarginBox === "bottom-left"}
					onClick={() => onMarginBoxSelect("bottom-left")}
					title="Bottom Left"
				/>
				<MarginBoxButton
					abbreviation="BC"
					boxName="bottom-center"
					className="flex-1 mx-1"
					hasContent={marginBoxes["bottom-center"].type !== "none"}
					isSelected={selectedMarginBox === "bottom-center"}
					onClick={() => onMarginBoxSelect("bottom-center")}
					title="Bottom Center"
				/>
				<MarginBoxButton
					abbreviation="BR"
					boxName="bottom-right"
					className="flex-1 mx-1"
					hasContent={marginBoxes["bottom-right"].type !== "none"}
					isSelected={selectedMarginBox === "bottom-right"}
					onClick={() => onMarginBoxSelect("bottom-right")}
					title="Bottom Right"
				/>
			</div>
			<div className="absolute flex flex-col" style={{ left: "-16px", top: "48px", bottom: "48px", width: "32px" }}>
				<MarginBoxButton
					abbreviation="LT"
					boxName="left-top"
					className="flex-1 my-1"
					hasContent={marginBoxes["left-top"].type !== "none"}
					isSelected={selectedMarginBox === "left-top"}
					onClick={() => onMarginBoxSelect("left-top")}
					title="Left Top"
				/>
				<MarginBoxButton
					abbreviation="LM"
					boxName="left-middle"
					className="flex-1 my-1"
					hasContent={marginBoxes["left-middle"].type !== "none"}
					isSelected={selectedMarginBox === "left-middle"}
					onClick={() => onMarginBoxSelect("left-middle")}
					title="Left Middle"
				/>
				<MarginBoxButton
					abbreviation="LB"
					boxName="left-bottom"
					className="flex-1 my-1"
					hasContent={marginBoxes["left-bottom"].type !== "none"}
					isSelected={selectedMarginBox === "left-bottom"}
					onClick={() => onMarginBoxSelect("left-bottom")}
					title="Left Bottom"
				/>
			</div>
			<div className="absolute flex flex-col" style={{ right: "-16px", top: "48px", bottom: "48px", width: "32px" }}>
				<MarginBoxButton
					abbreviation="RT"
					boxName="right-top"
					className="flex-1 my-1"
					hasContent={marginBoxes["right-top"].type !== "none"}
					isSelected={selectedMarginBox === "right-top"}
					onClick={() => onMarginBoxSelect("right-top")}
					title="Right Top"
				/>
				<MarginBoxButton
					abbreviation="RM"
					boxName="right-middle"
					className="flex-1 my-1"
					hasContent={marginBoxes["right-middle"].type !== "none"}
					isSelected={selectedMarginBox === "right-middle"}
					onClick={() => onMarginBoxSelect("right-middle")}
					title="Right Middle"
				/>
				<MarginBoxButton
					abbreviation="RB"
					boxName="right-bottom"
					className="flex-1 my-1"
					hasContent={marginBoxes["right-bottom"].type !== "none"}
					isSelected={selectedMarginBox === "right-bottom"}
					onClick={() => onMarginBoxSelect("right-bottom")}
					title="Right Bottom"
				/>
			</div>
			<div className="absolute inset-4 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
				Page Content
			</div>
		</div>
	</div>
);

// Render the margin box editor
const MarginBoxEditor: React.FC<{
	selectedMarginBox: string | null;
	marginBoxes: Record<string, MarginBoxConfig>;
	onMarginBoxUpdate: (boxName: string, updates: Partial<MarginBoxConfig>) => void;
}> = ({ selectedMarginBox, marginBoxes, onMarginBoxUpdate }) => {
	if (!selectedMarginBox) {
		return (
			<div className="text-center py-8 text-gray-500">
				<p>Click on a margin box in the page layout to configure it</p>
			</div>
		);
	}

	const config = marginBoxes[selectedMarginBox];
	
	return (
		<div className="space-y-4">
			<div>
				<Label className="text-base font-medium">
					Editing: {getMarginBoxDisplayName(selectedMarginBox)}
				</Label>
			</div>
			<div>
				<Label>Content Type</Label>
				<Select 
					onValueChange={(value: ContentType) => onMarginBoxUpdate(selectedMarginBox, { type: value })}
					value={config.type}
				>
					<SelectTrigger className="mt-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">None</SelectItem>
						<SelectItem value="text">Custom Text</SelectItem>
						<SelectItem value="page-counter">Page Number</SelectItem>
						<SelectItem value="page-counter-total">Page X of Y</SelectItem>
						<SelectItem value="running-header">Running Header</SelectItem>
						<SelectItem value="image">Image/Logo</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{config.type === "text" && (
				<div>
					<Label>Text Content</Label>
					<Input
						className="mt-1"
						onChange={(e) => onMarginBoxUpdate(selectedMarginBox, { content: e.target.value })}
						placeholder="Enter your text"
						value={config.content}
					/>
				</div>
			)}
			{config.type === "page-counter-total" && (
				<div>
					<Label>Format</Label>
					<Input
						className="mt-1"
						onChange={(e) => onMarginBoxUpdate(selectedMarginBox, { content: e.target.value })}
						placeholder="Use {page} and {total} placeholders"
						value={config.content}
					/>
					<p className="text-xs text-gray-500 mt-1">
						Example: &quot;Page of pages &quot;
					</p>
				</div>
			)}
			{config.type === "running-header" && (
				<div className="space-y-2">
					<div>
						<Label>Running Header Selector</Label>
						<Input
							className="mt-1"
							onChange={(e) => onMarginBoxUpdate(selectedMarginBox, { runningSelector: e.target.value })}
							placeholder="e.g., chapterTitle"
							value={config.runningSelector || ""}
						/>
						<p className="text-xs text-gray-500 mt-1">
							You&apos;ll need to add CSS like: h2 {"{ string-set: chapterTitle content(text); }"}
						</p>
					</div>
				</div>
			)}
			{config.type === "image" && (
				<div>
					<Label>Image URL</Label>
					<Input
						className="mt-1"
						onChange={(e) => onMarginBoxUpdate(selectedMarginBox, { content: e.target.value })}
						placeholder="https://example.com/logo.png"
						value={config.content}
					/>
				</div>
			)}
			{config.type !== "none" && (
				<Button
					className="w-full"
					onClick={() => onMarginBoxUpdate(selectedMarginBox, { type: "none", content: "" })}
					variant="outline"
				>
					Clear Content
				</Button>
			)}
		</div>
	);
};

export default function MarginBoxInterface({ 
	marginBoxes, 
	selectedMarginBox, 
	onMarginBoxSelect, 
	onMarginBoxUpdate,
}: MarginBoxInterfaceProps): React.JSX.Element {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* Visual Page Layout */}
			<div>
				<h4 className="text-lg font-semibold mb-4">Page Layout</h4>
				<div className="bg-gray-50 p-8 rounded-lg">
					<PageLayout
						marginBoxes={marginBoxes}
						onMarginBoxSelect={onMarginBoxSelect}
						selectedMarginBox={selectedMarginBox}
					/>
				</div>
				<div className="mt-4 text-sm text-gray-600">
					<p><span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded mr-2" />Configured</p>
					<p><span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2" />Selected</p>
					<p><span className="inline-block w-3 h-3 bg-gray-50 border border-gray-300 rounded mr-2" />Empty</p>
				</div>
			</div>
			<div>
				<h4 className="text-lg font-semibold mb-4">Configuration</h4>
				<div className="border rounded-lg p-4">
					<MarginBoxEditor
						marginBoxes={marginBoxes}
						onMarginBoxUpdate={onMarginBoxUpdate}
						selectedMarginBox={selectedMarginBox}
					/>
				</div>
			</div>
		</div>
	);
}

// Export utility function for generating CSS
export const buildMarginBoxCSS = (marginBoxes: Record<string, MarginBoxConfig>): string => {
	const marginBoxCSS: string[] = [];
	
	// Generate CSS for each configured margin box
	Object.entries(marginBoxes).forEach(([boxName, config]) => {
		if (config.type === "none") return;
		
		let content = "";
		
		switch (config.type) {
			case "text":
				content = `"${config.content.replace(/"/g, "\\\"")}"`;
				break;
			case "page-counter":
				content = "counter(page)";
				break;
			case "page-counter-total":
				// Replace placeholders like {page} and {total}
				let pageContent = config.content;
				pageContent = pageContent.replace(/\{page\}/g, "\" counter(page) \"");
				pageContent = pageContent.replace(/\{total\}/g, "\" counter(pages) \"");
				content = `"${pageContent}"`;
				break;
			case "running-header":
				if (config.runningSelector) {
					content = `string(${config.runningSelector})`;
				}
				break;
			case "image":
				content = `url("${config.content}")`;
				break;
		}
		
		if (content) {
			marginBoxCSS.push(`@${boxName} { content: ${content}; }`);
		}
	});
	
	return marginBoxCSS.join("\n");
};
