import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import clsx from "clsx";
import { DocumentDropZoneProps } from "./types";

export const DocumentDropZone: React.FC<DocumentDropZoneProps> = ({
	children,
	onFilesDropped,
	disabled = false,
	className,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragCounter, setDragCounter] = useState(0);

	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragCounter((prev) => prev + 1);
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setIsDragging(true);
		}
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragCounter((prev) => {
			const newCounter = prev - 1;
			if (newCounter === 0) {
				setIsDragging(false);
			}
			return newCounter;
		});
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		setDragCounter(0);

		if (disabled) return;

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			onFilesDropped(files);
		}
	}, [disabled, onFilesDropped]);

	return (
		<div
			className={clsx(
				"relative transition-all duration-200",
				isDragging && !disabled && "ring-2 ring-blue-400 ring-inset",
				className,
			)}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{children}

			{/* Drag Overlay */}
			{isDragging && !disabled && (
				<div className="absolute inset-0 bg-blue-50/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-400">
					<div className="text-center">
						<Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
						<p className="text-lg font-medium text-blue-700">
							Drop files here to upload
						</p>
						<p className="text-sm text-blue-600 mt-1">
							Files will be uploaded to the current folder
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

