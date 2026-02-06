"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import FloatingSaveIndicator from "./FloatingSaveIndicator";

// Define types locally to avoid import issues
interface ExcalidrawElementBase {
	id: string;
	type: string;
	x: number;
	y: number;
	[key: string]: unknown;
}

interface ExcalidrawAppState {
	viewBackgroundColor?: string;
	gridSize?: number | null;
	[key: string]: unknown;
}

interface ExcalidrawFiles {
	[key: string]: {
		mimeType: string;
		id: string;
		dataURL: string;
		created: number;
	};
}

interface ExcalidrawData {
	type: "excalidraw";
	version: number;
	elements: ExcalidrawElementBase[];
	appState?: Partial<ExcalidrawAppState>;
	files?: ExcalidrawFiles;
}

interface ExcalidrawEditorProps {
	content: string;
	documentName?: string;
	isSaving?: boolean;
	onSave?: (updated: string) => void;
}

// Inner component that actually renders Excalidraw (only on client)
const ExcalidrawCanvas: React.FC<{
	initialData: ExcalidrawData;
	onApiReady: (api: any) => void;
	onChange: () => void;
}> = ({ initialData, onApiReady, onChange }) => {
	const [ExcalidrawComponents, setExcalidrawComponents] = useState<{
		Excalidraw: any;
		MainMenu: any;
		WelcomeScreen: any;
	} | null>(null);

	useEffect(() => {
		// Dynamically import Excalidraw on client side only
		const loadExcalidraw = async () => {
			try {
				const excalidrawModule = await import("@excalidraw/excalidraw");
				// Also import CSS
				await import("@excalidraw/excalidraw/index.css");
				setExcalidrawComponents({
					Excalidraw: excalidrawModule.Excalidraw,
					MainMenu: excalidrawModule.MainMenu,
					WelcomeScreen: excalidrawModule.WelcomeScreen,
				});
			} catch (error) {
				console.error("Failed to load Excalidraw:", error);
			}
		};
		loadExcalidraw();
	}, []);

	if (!ExcalidrawComponents) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	const { Excalidraw, MainMenu, WelcomeScreen } = ExcalidrawComponents;

	return (
		<Excalidraw
			excalidrawAPI={onApiReady}
			initialData={{
				elements: initialData.elements,
				appState: initialData.appState,
				files: initialData.files,
			}}
			onChange={onChange}
		>
			<MainMenu>
				<MainMenu.DefaultItems.LoadScene />
				<MainMenu.DefaultItems.Export />
				<MainMenu.DefaultItems.SaveAsImage />
				<MainMenu.DefaultItems.ClearCanvas />
				<MainMenu.DefaultItems.ToggleTheme />
				<MainMenu.DefaultItems.ChangeCanvasBackground />
			</MainMenu>
			<WelcomeScreen>
				<WelcomeScreen.Hints.ToolbarHint />
				<WelcomeScreen.Hints.MenuHint />
				<WelcomeScreen.Hints.HelpHint />
			</WelcomeScreen>
		</Excalidraw>
	);
};

const ExcalidrawEditor: React.FC<ExcalidrawEditorProps> = ({
	content,
	documentName,
	isSaving = false,
	onSave,
}) => {
	const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
	const [initialData, setInitialData] = useState<ExcalidrawData | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [parseError, setParseError] = useState<string | null>(null);
	const [isClient, setIsClient] = useState(false);
	const lastSavedContentRef = useRef<string>(content);
	const isInitializedRef = useRef(false);

	// Ensure we're on the client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Parse the initial content
	useEffect(() => {
		if (!content) {
			// Initialize with empty excalidraw data
			setInitialData({
				type: "excalidraw",
				version: 2,
				elements: [],
				appState: {
					viewBackgroundColor: "#ffffff",
				},
				files: {},
			});
			return;
		}

		try {
			const parsed = JSON.parse(content) as ExcalidrawData;
			
			// Validate it's an excalidraw file
			if (parsed.type !== "excalidraw") {
				setParseError("Invalid file: not an Excalidraw file");
				return;
			}

			setInitialData(parsed);
			setParseError(null);
			lastSavedContentRef.current = content;
		} catch (e) {
			setParseError(`Failed to parse Excalidraw file: ${e instanceof Error ? e.message : "Unknown error"}`);
		}
	}, [content]);

	// Reset initialized flag when content changes from external source
	useEffect(() => {
		if (content !== lastSavedContentRef.current) {
			isInitializedRef.current = false;
		}
	}, [content]);

	// Handle changes in the editor
	const handleChange = useCallback(() => {
		// Skip initial render
		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
			return;
		}
		// Mark as having changes
		setHasChanges(true);
	}, []);

	// Save the current state
	const handleSave = useCallback(() => {
		if (!excalidrawAPI || !onSave) return;

		const elements = excalidrawAPI.getSceneElements();
		const appState = excalidrawAPI.getAppState();
		const files = excalidrawAPI.getFiles();

		const data: ExcalidrawData = {
			type: "excalidraw",
			version: 2,
			elements: elements as ExcalidrawElementBase[],
			appState: {
				viewBackgroundColor: appState.viewBackgroundColor,
				gridSize: appState.gridSize,
			},
			files: files || {},
		};

		const jsonString = JSON.stringify(data, null, 2);
		lastSavedContentRef.current = jsonString;
		setHasChanges(false);
		onSave(jsonString);
	}, [excalidrawAPI, onSave]);

	// Handle keyboard shortcuts
	useEffect(() => {
		if (!isClient) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				handleSave();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleSave, isClient]);

	if (parseError) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<div className="text-center p-4">
					<p className="text-red-500 mb-2">Error loading Excalidraw file</p>
					<p className="text-sm text-gray-500">{parseError}</p>
				</div>
			</div>
		);
	}

	// Show loading state until we're on client and have initial data
	if (!isClient || !initialData) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="h-full w-full relative">
			<ExcalidrawCanvas
				initialData={initialData}
				onApiReady={setExcalidrawAPI}
				onChange={handleChange}
			/>
			<FloatingSaveIndicator
				hasChanges={hasChanges}
				isSaving={isSaving}
				onSave={handleSave}
			/>
		</div>
	);
};

export default ExcalidrawEditor;
