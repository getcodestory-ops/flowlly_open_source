import React, { useRef, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { CoverElement } from "./types";

interface DesignCanvasProps {
	elements: CoverElement[];
	selectedElementId: string | null;
	canvasWidth: number;
	canvasHeight: number;
	isDragging: boolean;
	isResizing: boolean;
	dragOffset: { x: number; y: number };
	resizeHandle: string | null;
	onElementSelect: (id: string | null) => void;
	onElementUpdate: (id: string, updates: Partial<CoverElement>) => void;
	onDragStart: (e: React.MouseEvent, elementId: string) => void;
	onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export default function DesignCanvas({
	elements,
	selectedElementId,
	canvasWidth,
	canvasHeight,
	isDragging,
	isResizing,
	dragOffset,
	resizeHandle,
	onElementSelect,
	onElementUpdate,
	onDragStart,
	onResizeStart,
}: DesignCanvasProps): React.JSX.Element {
	const canvasRef = useRef<HTMLDivElement>(null);

	const selectedElement = elements.find((el) => el.id === selectedElementId);

	// Global mouse move handler
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent): void => {
			if (!canvasRef.current) return;

			const rect = canvasRef.current.getBoundingClientRect();

			if (isDragging && selectedElementId) {
				const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
				const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
				
				// Constrain to canvas
				const constrainedX = Math.max(0, Math.min(100, newX));
				const constrainedY = Math.max(0, Math.min(100, newY));
				
				onElementUpdate(selectedElementId, { x: constrainedX, y: constrainedY });
			}

			if (isResizing && selectedElementId && selectedElement && resizeHandle) {
				const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
				const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

				let newWidth = selectedElement.width;
				let newHeight = selectedElement.height;
				let newX = selectedElement.x;
				let newY = selectedElement.y;

				switch (resizeHandle) {
					case "se": // Southeast
						newWidth = Math.max(5, mouseX - selectedElement.x);
						newHeight = Math.max(5, mouseY - selectedElement.y);
						break;
					case "sw": // Southwest
						newWidth = Math.max(5, selectedElement.x + selectedElement.width - mouseX);
						newHeight = Math.max(5, mouseY - selectedElement.y);
						newX = Math.min(selectedElement.x + selectedElement.width - 5, mouseX);
						break;
					case "ne": // Northeast
						newWidth = Math.max(5, mouseX - selectedElement.x);
						newHeight = Math.max(5, selectedElement.y + selectedElement.height - mouseY);
						newY = Math.min(selectedElement.y + selectedElement.height - 5, mouseY);
						break;
					case "nw": // Northwest
						newWidth = Math.max(5, selectedElement.x + selectedElement.width - mouseX);
						newHeight = Math.max(5, selectedElement.y + selectedElement.height - mouseY);
						newX = Math.min(selectedElement.x + selectedElement.width - 5, mouseX);
						newY = Math.min(selectedElement.y + selectedElement.height - 5, mouseY);
						break;
				}

				// Constrain to canvas
				if (newX + newWidth > 100) newWidth = 100 - newX;
				if (newY + newHeight > 100) newHeight = 100 - newY;

				onElementUpdate(selectedElementId, { 
					x: newX, 
					y: newY, 
					width: newWidth, 
					height: newHeight, 
				});
			}
		};

		const handleMouseUp = (): void => {
			// These will be handled by parent component
		};

		if (isDragging || isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			
			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [isDragging, isResizing, selectedElementId, selectedElement, dragOffset, resizeHandle, canvasWidth, canvasHeight, onElementUpdate]);

	// Render element on canvas
	const renderElement = (element: CoverElement): React.JSX.Element => {
		const isSelected = element.id === selectedElementId;
		
		const style: React.CSSProperties = {
			position: "absolute",
			left: `${element.x}%`,
			top: `${element.y}%`,
			width: `${element.width}%`,
			height: `${element.height}%`,
			transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
			zIndex: element.zIndex,
			cursor: isDragging ? "grabbing" : "grab",
			backgroundColor: element.backgroundColor,
			border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : undefined,
			borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
			opacity: element.opacity,
			...(isSelected && {
				outline: "2px solid #3b82f6",
				outlineOffset: "-2px",
			}),
		};

		let content: React.ReactNode = null;

		if (element.type === "text") {
			const textStyle: React.CSSProperties = {
				fontSize: `${element.fontSize}px`,
				fontFamily: element.fontFamily,
				fontWeight: element.fontWeight,
				fontStyle: element.fontStyle,
				textDecoration: element.textDecoration,
				textAlign: element.textAlign,
				color: element.color,
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: element.textAlign === "left" ? "flex-start" : 
					element.textAlign === "right" ? "flex-end" : "center",
				padding: "4px",
				boxSizing: "border-box",
				wordWrap: "break-word",
				overflow: "hidden",
			};
			content = <div style={textStyle}>{element.text}</div>;
		} else if (element.type === "image" || element.type === "logo") {
			const imgStyle: React.CSSProperties = {
				width: "100%",
				height: "100%",
				objectFit: element.objectFit,
				display: "block",
			};
			content = element.src ? (
				<img 
					alt={element.alt} 
					draggable={false} 
					src={element.src}
					style={imgStyle}
				/>
			) : (
				<div 
					style={{
						width: "100%",
						height: "100%",
						backgroundColor: "#f3f4f6",
						border: "2px dashed #d1d5db",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#6b7280",
						fontSize: "12px",
					}}
				>
					<ImageIcon size={20} />
				</div>
			);
		}

		return (
			<div
				className="group"
				key={element.id}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onElementSelect(element.id);
				}}
				onMouseDown={(e) => onDragStart(e, element.id)}
				style={style}
			>
				{content}
				{isSelected && (
					<>
						<div
							className="absolute w-2 h-2 bg-blue-500 border border-white cursor-nw-resize"
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onResizeStart(e, "nw");
							}}
							style={{ top: "-4px", left: "-4px" }}
						/>
						<div
							className="absolute w-2 h-2 bg-blue-500 border border-white cursor-ne-resize"
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onResizeStart(e, "ne");
							}}
							style={{ top: "-4px", right: "-4px" }}
						/>
						<div
							className="absolute w-2 h-2 bg-blue-500 border border-white cursor-sw-resize"
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onResizeStart(e, "sw");
							}}
							style={{ bottom: "-4px", left: "-4px" }}
						/>
						<div
							className="absolute w-2 h-2 bg-blue-500 border border-white cursor-se-resize"
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onResizeStart(e, "se");
							}}
							style={{ bottom: "-4px", right: "-4px" }}
						/>
					</>
				)}
			</div>
		);
	};

	return (
		<div className="w-full">
			<div className="bg-gray-100 p-4 rounded-lg">
				<div
					className="relative bg-white border border-gray-300 mx-auto"
					onClick={() => onElementSelect(null)}
					ref={canvasRef}
					style={{
						width: canvasWidth,
						height: canvasHeight,
						maxWidth: "100%",
						aspectRatio: `${canvasWidth}/${canvasHeight}`,
					}}
				>
					<div className="absolute inset-0 bg-white" />
					<div 
						className="absolute inset-0 opacity-20 pointer-events-none"
						style={{
							backgroundImage: `
								linear-gradient(to right, #e5e7eb 1px, transparent 1px),
								linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
							`,
							backgroundSize: `${canvasWidth / 20}px ${canvasHeight / 20}px`,
						}}
					/>
					{elements
						.sort((a, b) => a.zIndex - b.zIndex)
						.map((element) => renderElement(element))
					}
				</div>
				<div className="mt-2 text-xs text-gray-500 text-center">
					A4 Page (210 × 297mm) • Click to deselect • Drag to move • Drag corners to resize
				</div>
			</div>
		</div>
	);
}
