import React, { useState, useCallback, useEffect } from "react";
import type { CoverElement, CoverPageDesignerProps } from "./types";
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "./types";
import { createNewElement, duplicateElement, getZIndexChange, generateId } from "./utils";
import DesignCanvas from "./DesignCanvas";
import PropertiesPanel from "./PropertiesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Type, Image, Building2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Simple Form Mode Component
interface SimpleFormModeProps {
	coverTitle: string;
	coverSubtitle: string;
	coverLogoUrl: string;
	dateText: string;
	preparedFor: string;
	preparedBy: string;
	onSimpleFormChange?: (updates: {
		coverTitle?: string;
		coverSubtitle?: string;
		coverLogoUrl?: string;
		dateText?: string;
		preparedFor?: string;
		preparedBy?: string;
	}) => void;
}

function SimpleFormMode({
	coverTitle,
	coverSubtitle,
	coverLogoUrl,
	dateText,
	preparedFor,
	preparedBy,
	onSimpleFormChange,
}: SimpleFormModeProps): React.JSX.Element {
	return (
		<div className="space-y-4">
			<div>
				<Label htmlFor="cover-title">Cover Title</Label>
				<Input 
					className="mt-1"
					id="cover-title"
					onChange={(e) => onSimpleFormChange?.({ coverTitle: e.target.value })}
					placeholder="Report Title"
					value={coverTitle}
				/>
			</div>
			<div>
				<Label htmlFor="cover-subtitle">Cover Subtitle</Label>
				<Input 
					className="mt-1"
					id="cover-subtitle"
					onChange={(e) => onSimpleFormChange?.({ coverSubtitle: e.target.value })}
					placeholder="Subtitle or description"
					value={coverSubtitle}
				/>
			</div>
			<div>
				<Label htmlFor="cover-logo">Cover Logo URL</Label>
				<Input 
					className="mt-1"
					id="cover-logo"
					onChange={(e) => onSimpleFormChange?.({ coverLogoUrl: e.target.value })}
					placeholder="https://..."
					value={coverLogoUrl}
				/>
			</div>
			<div>
				<Label htmlFor="date-text">Date Text</Label>
				<Input 
					className="mt-1"
					id="date-text"
					onChange={(e) => onSimpleFormChange?.({ dateText: e.target.value })}
					placeholder="December 2025"
					value={dateText}
				/>
			</div>
			<div>
				<Label htmlFor="prepared-for">Prepared For</Label>
				<Textarea 
					className="mt-1"
					id="prepared-for"
					onChange={(e) => onSimpleFormChange?.({ preparedFor: e.target.value })}
					placeholder="Client name or organization"
					rows={2}
					value={preparedFor}
				/>
			</div>
			<div>
				<Label htmlFor="prepared-by">Prepared By</Label>
				<Textarea 
					className="mt-1"
					id="prepared-by"
					onChange={(e) => onSimpleFormChange?.({ preparedBy: e.target.value })}
					placeholder="Your name or company"
					rows={2}
					value={preparedBy}
				/>
			</div>
		</div>
	);
}

// Complex Design Mode Component
interface ComplexDesignModeProps {
	onAddElement: (type: CoverElement["type"]) => void;
	selectedElement: CoverElement | undefined;
	onElementDelete: (id: string) => void;
	onElementDuplicate: (id: string) => void;
	onElementUpdate: (id: string, updates: Partial<CoverElement>) => void;
	onElementZChange: (id: string, direction: "front" | "back") => void;
}

function ComplexDesignMode({
	onAddElement,
	selectedElement,
	onElementDelete,
	onElementDuplicate,
	onElementUpdate,
	onElementZChange,
}: ComplexDesignModeProps): React.JSX.Element {
	return (
		<div className="space-y-4">
			{/* Add Elements Section */}
			<div>
				<Label className="text-sm font-medium mb-3 block">Add Elements</Label>
				<div className="space-y-2">
					<Button
						className="w-full justify-start"
						onClick={() => onAddElement("text")}
						size="sm"
						variant="outline"
					>
						<Type className="w-4 h-4 mr-2" />
						Add Text
					</Button>
					<Button
						className="w-full justify-start"
						onClick={() => onAddElement("image")}
						size="sm"
						variant="outline"
					>
						<Image className="w-4 h-4 mr-2" />
						Add Image
					</Button>
					<Button
						className="w-full justify-start"
						onClick={() => onAddElement("logo")}
						size="sm"
						variant="outline"
					>
						<Building2 className="w-4 h-4 mr-2" />
						Add Logo
					</Button>
				</div>
			</div>
			<div className="border-t pt-4">
				<Label className="text-sm font-medium mb-3 block">Element Properties</Label>
				<PropertiesPanel
					onElementDelete={onElementDelete}
					onElementDuplicate={onElementDuplicate}
					onElementUpdate={onElementUpdate}
					onElementZChange={onElementZChange}
					selectedElement={selectedElement || null}
				/>
			</div>
		</div>
	);
}

export default function CoverPageDesignerRoot({
	elements,
	onElementsChange,
	canvasWidth = DEFAULT_CANVAS_WIDTH,
	canvasHeight = DEFAULT_CANVAS_HEIGHT,
	coverTitle = "",
	coverSubtitle = "",
	coverLogoUrl = "",
	dateText = "",
	preparedFor = "",
	preparedBy = "",
	onSimpleFormChange,
}: CoverPageDesignerProps): React.JSX.Element {
	const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState<string | null>(null);

	const selectedElement = elements.find((el) => el.id === selectedElementId);

	// Add new element
	const handleAddElement = (type: CoverElement["type"]): void => {
		const newElement = createNewElement(type, elements.length);
		const newElements = [...elements, newElement];
		onElementsChange(newElements);
		setSelectedElementId(newElement.id);
	};

	// Update element properties
	const handleElementUpdate = useCallback((id: string, updates: Partial<CoverElement>): void => {
		const newElements = elements.map((el) => 
			el.id === id ? { ...el, ...updates } : el,
		);
		onElementsChange(newElements);
	}, [elements, onElementsChange]);

	// Delete element
	const handleElementDelete = (id: string): void => {
		const newElements = elements.filter((el) => el.id !== id);
		onElementsChange(newElements);
		if (selectedElementId === id) {
			setSelectedElementId(null);
		}
	};

	// Duplicate element
	const handleElementDuplicate = (id: string): void => {
		const elementToDuplicate = elements.find((el) => el.id === id);
		if (!elementToDuplicate) return;

		const newElement = duplicateElement(elementToDuplicate, elements.length);
		const newElements = [...elements, newElement];
		onElementsChange(newElements);
		setSelectedElementId(newElement.id);
	};

	// Move element to front/back
	const handleZIndexChange = (id: string, direction: "front" | "back"): void => {
		const newZIndex = getZIndexChange(elements, direction);
		handleElementUpdate(id, { zIndex: newZIndex });
	};

	// Mouse handlers for dragging
	const handleDragStart = (e: React.MouseEvent, elementId: string): void => {
		e.preventDefault();
		e.stopPropagation();
		
		const element = elements.find((el) => el.id === elementId);
		if (!element) return;

		// Only start dragging if the element is already selected
		// This prevents immediate drag when just trying to select
		if (selectedElementId === elementId) {
			setIsDragging(true);
			
			// Calculate offset for dragging using actual DOM sizes
			// Use the clicked element's bounding rect to get the mouse position within the element
			const target = e.currentTarget as HTMLElement;
			const targetRect = target.getBoundingClientRect();
			setDragOffset({
				x: e.clientX - targetRect.left,
				y: e.clientY - targetRect.top,
			});
		} else {
			// Just select the element if it wasn't already selected
			setSelectedElementId(elementId);
		}
	};

	// Mouse handlers for resizing
	const handleResizeStart = (e: React.MouseEvent, handle: string): void => {
		e.preventDefault();
		e.stopPropagation();
		setIsResizing(true);
		setResizeHandle(handle);
	};

	// Handle mouse up events
	React.useEffect(() => {
		const handleMouseUp = (): void => {
			setIsDragging(false);
			setIsResizing(false);
			setResizeHandle(null);
		};

		if (isDragging || isResizing) {
			document.addEventListener("mouseup", handleMouseUp);
			return () => document.removeEventListener("mouseup", handleMouseUp);
		}
	}, [isDragging, isResizing]);

	// Create elements from simple form data
	const createSimpleFormElements = useCallback((formData: {
		coverTitle?: string;
		coverSubtitle?: string;
		coverLogoUrl?: string;
		dateText?: string;
		preparedFor?: string;
		preparedBy?: string;
	}): CoverElement[] => {
		const newElements: CoverElement[] = [];
		let yPosition = 15; // Start from top

		// Logo (if provided)
		if (formData.coverLogoUrl) {
			newElements.push({
				id: generateId(),
				type: "logo",
				x: 35,
				y: yPosition,
				width: 30,
				height: 15,
				zIndex: newElements.length,
				src: formData.coverLogoUrl,
				alt: "Cover Logo",
				objectFit: "contain",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
			yPosition += 20;
		}

		// Title (if provided)
		if (formData.coverTitle) {
			newElements.push({
				id: generateId(),
				type: "text",
				x: 10,
				y: yPosition,
				width: 80,
				height: 8,
				zIndex: newElements.length,
				text: formData.coverTitle,
				fontSize: 24,
				fontFamily: "Arial, sans-serif",
				fontWeight: "bold",
				fontStyle: "normal",
				textDecoration: "none",
				textAlign: "center",
				color: "#000000",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
			yPosition += 12;
		}

		// Subtitle (if provided)
		if (formData.coverSubtitle) {
			newElements.push({
				id: generateId(),
				type: "text",
				x: 10,
				y: yPosition,
				width: 80,
				height: 6,
				zIndex: newElements.length,
				text: formData.coverSubtitle,
				fontSize: 16,
				fontFamily: "Arial, sans-serif",
				fontWeight: "normal",
				fontStyle: "normal",
				textDecoration: "none",
				textAlign: "center",
				color: "#666666",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
			yPosition += 10;
		}

		// Position "Prepared For" and "Prepared By" in the bottom area (around 75-85% down)
		let bottomYPosition = 75;

		// Prepared For (if provided)
		if (formData.preparedFor) {
			newElements.push({
				id: generateId(),
				type: "text",
				x: 10,
				y: bottomYPosition,
				width: 80,
				height: 6,
				zIndex: newElements.length,
				text: `Prepared for: ${formData.preparedFor}`,
				fontSize: 12,
				fontFamily: "Arial, sans-serif",
				fontWeight: "normal",
				fontStyle: "normal",
				textDecoration: "none",
				textAlign: "left",
				color: "#333333",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
			bottomYPosition += 8;
		}

		// Prepared By (if provided)
		if (formData.preparedBy) {
			newElements.push({
				id: generateId(),
				type: "text",
				x: 10,
				y: bottomYPosition,
				width: 80,
				height: 6,
				zIndex: newElements.length,
				text: `Prepared by: ${formData.preparedBy}`,
				fontSize: 12,
				fontFamily: "Arial, sans-serif",
				fontWeight: "normal",
				fontStyle: "normal",
				textDecoration: "none",
				textAlign: "left",
				color: "#333333",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
			bottomYPosition += 8;
		}

		// Date (if provided) - position at the very bottom
		if (formData.dateText) {
			newElements.push({
				id: generateId(),
				type: "text",
				x: 10,
				y: Math.max(bottomYPosition + 5, 90), // Position below "Prepared" sections or at bottom
				width: 80,
				height: 5,
				zIndex: newElements.length,
				text: formData.dateText,
				fontSize: 12,
				fontFamily: "Arial, sans-serif",
				fontWeight: "normal",
				fontStyle: "normal",
				textDecoration: "none",
				textAlign: "center",
				color: "#666666",
				backgroundColor: "transparent",
				borderColor: "#cccccc",
				borderWidth: 0,
				borderRadius: 0,
				opacity: 1,
			});
		}

		return newElements;
	}, []);

	// Initialize canvas with simple form elements if form data exists
	useEffect(() => {
		const formData = { coverTitle, coverSubtitle, coverLogoUrl, dateText, preparedFor, preparedBy };
		const hasSimpleContent = Object.values(formData).some((value) => value && value.trim() !== "");
		
		// Only initialize if we have form content but no canvas elements
		if (hasSimpleContent && elements.length === 0) {
			const simpleElements = createSimpleFormElements(formData);
			onElementsChange(simpleElements);
		}
	}, [coverTitle, coverSubtitle, coverLogoUrl, dateText, preparedFor, preparedBy, elements.length, createSimpleFormElements, onElementsChange]);

	// Handle simple form changes and update canvas
	const handleSimpleFormChange = useCallback((updates: {
		coverTitle?: string;
		coverSubtitle?: string;
		coverLogoUrl?: string;
		dateText?: string;
		preparedFor?: string;
		preparedBy?: string;
	}) => {
		// Call the parent's onSimpleFormChange to update form state
		onSimpleFormChange?.(updates);

		// Create new simple form elements and replace them on canvas
		const currentFormData = {
			coverTitle,
			coverSubtitle, 
			coverLogoUrl,
			dateText,
			preparedFor,
			preparedBy,
			...updates, // Apply the new updates
		};

		// Only update canvas if we're in simple mode and have some content
		const hasSimpleContent = Object.values(currentFormData).some((value) => value && value.trim() !== "");
		
		if (hasSimpleContent) {
			const simpleElements = createSimpleFormElements(currentFormData);
			
			// Keep only manually added elements (complex mode elements) and replace simple form elements
			const manualElements = elements.filter((el) => !isSimpleFormElement(el));
			const newElements = [...manualElements, ...simpleElements];
			
			onElementsChange(newElements);
		}
	}, [coverTitle, coverSubtitle, coverLogoUrl, dateText, preparedFor, preparedBy, onSimpleFormChange, createSimpleFormElements, elements, onElementsChange]);

	// Helper to identify simple form elements (positioned in typical form layout)
	const isSimpleFormElement = (element: CoverElement): boolean => {
		// Simple heuristic: elements positioned in the typical simple form layout areas
		return Boolean(
			(element.type === "logo" && element.x >= 30 && element.x <= 40 && element.y <= 35) ||
			(element.type === "text" && element.x <= 15 && element.width >= 70) ||
			(element.type === "text" && element.textAlign === "center" && element.y <= 50) ||
			(element.type === "text" && element.textAlign === "left" && element.y >= 70) || // Bottom-left elements
			(element.type === "text" && element.text?.includes("Prepared for:")) ||
			(element.type === "text" && element.text?.includes("Prepared by:")),
		);
	};

	return (
		<div className="space-y-6 w-full">
			{/* Main Layout: Design Canvas | Properties */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
				{/* Design Canvas */}
				<div className="xl:col-span-2">
					<DesignCanvas
						canvasHeight={canvasHeight}
						canvasWidth={canvasWidth}
						dragOffset={dragOffset}
						elements={elements}
						isDragging={isDragging}
						isResizing={isResizing}
						onDragStart={handleDragStart}
						onElementSelect={setSelectedElementId}
						onElementUpdate={handleElementUpdate}
						onResizeStart={handleResizeStart}
						resizeHandle={resizeHandle}
						selectedElementId={selectedElementId}
					/>
				</div>
				<div className="xl:col-span-1">
					<h4 className="text-lg font-semibold mb-4">Properties</h4>
					<div className="border rounded-lg overflow-hidden">
						<Tabs className="w-full" defaultValue="simple">
							<TabsList className="grid w-full grid-cols-2 rounded-none border-b">
								<TabsTrigger className="rounded-none" value="simple">Simple</TabsTrigger>
								<TabsTrigger className="rounded-none" value="complex">Complex</TabsTrigger>
							</TabsList>
							<TabsContent className="p-4 m-0 min-h-96" value="simple">
								<SimpleFormMode 
									coverLogoUrl={coverLogoUrl}
									coverSubtitle={coverSubtitle}
									coverTitle={coverTitle}
									dateText={dateText}
									onSimpleFormChange={handleSimpleFormChange}
									preparedBy={preparedBy}
									preparedFor={preparedFor}
								/>
							</TabsContent>
							<TabsContent className="p-4 m-0 min-h-96" value="complex">
								<ComplexDesignMode 
									onAddElement={handleAddElement}
									onElementDelete={handleElementDelete}
									onElementDuplicate={handleElementDuplicate}
									onElementUpdate={handleElementUpdate}
									onElementZChange={handleZIndexChange}
									selectedElement={selectedElement}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	);
}
