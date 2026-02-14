"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import FloatingSaveIndicator from "./FloatingSaveIndicator";

// Types for the lazily-loaded DopeCanvas modules
interface DopeCanvasModules {
	DopeCanvas: React.ForwardRefExoticComponent<any>;
	Toolbar: React.FC<any>;
}

interface DopeCanvasEditorProps {
	content: string;
	documentName?: string;
	isSaving?: boolean;
	onSave?: (updated: string) => void;
}

const DOP_SCOPE_CLASS = "dop-content-root";

const scopeEmbeddedStyles = (html: string): string => {
	return html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_fullMatch, cssText: string) => {
		const scopedCss = cssText.replace(/(^|})\s*([^@}{][^{}]*)\{/g, (_m, prefix: string, selectorGroup: string) => {
			const scopedSelectors = selectorGroup
				.split(",")
				.map((selector) => {
					const trimmed = selector.trim();
					if (!trimmed) return trimmed;
					if (trimmed.startsWith(`.${DOP_SCOPE_CLASS}`)) return trimmed;
					if (trimmed === "*" || trimmed === "body" || trimmed === "html" || trimmed === ":root") {
						return `.${DOP_SCOPE_CLASS}`;
					}
					if (trimmed.startsWith("body ")) {
						return `.${DOP_SCOPE_CLASS} ${trimmed.replace(/^body\s+/, "")}`;
					}
					if (trimmed.startsWith("html ")) {
						return `.${DOP_SCOPE_CLASS} ${trimmed.replace(/^html\s+/, "")}`;
					}
					return `.${DOP_SCOPE_CLASS} ${trimmed}`;
				})
				.join(", ");
			return `${prefix} ${scopedSelectors}{`;
		});
		return `<style>${scopedCss}</style>`;
	});
};

const DopeCanvasEditor: React.FC<DopeCanvasEditorProps> = ({
	content,
	documentName,
	isSaving = false,
	onSave,
}) => {
	const [modules, setModules] = useState<DopeCanvasModules | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [pageConfig, setPageConfig] = useState<any>(null);
	const [pageCount, setPageCount] = useState(1);

	const canvasHandleRef = useRef<any>(null);
	const lastSavedContentRef = useRef<string>(content);
	const isInitializedRef = useRef(false);
	const scopedHtml = useMemo(() => {
		const safeContent = content || "";
		return `<div class="${DOP_SCOPE_CLASS}">${scopeEmbeddedStyles(safeContent)}</div>`;
	}, [content]);

	// Ensure we're on the client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Dynamically import DopeCanvas on client side only
	useEffect(() => {
		if (!isClient) return;
		const loadDopeCanvas = async () => {
			try {
				const dopecanvasModule = await import("dopecanvas");
				// await import("dopecanvas/style.css");
				setModules({
					DopeCanvas: dopecanvasModule.DopeCanvas,
					Toolbar: dopecanvasModule.Toolbar,
				});
				if (dopecanvasModule.DEFAULT_PAGE_CONFIG) {
					setPageConfig(dopecanvasModule.DEFAULT_PAGE_CONFIG);
				}
			} catch (error) {
				console.error("Failed to load DopeCanvas:", error);
			}
		};
		loadDopeCanvas();
	}, [isClient]);

	// Handle changes in the editor
	const handleChange = useCallback(() => {
		if (!isInitializedRef.current) {
			isInitializedRef.current = true;
			return;
		}
		setHasChanges(true);
	}, []);

	// Save the current state
	const handleSave = useCallback(() => {
		if (!canvasHandleRef.current || !onSave) return;

		const currentHTML = canvasHandleRef.current.getHTML();
		if (currentHTML) {
			lastSavedContentRef.current = currentHTML;
			setHasChanges(false);
			onSave(currentHTML);
		}
	}, [onSave]);

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

	// Show loading state until we're on client and modules are loaded
	if (!isClient || !modules) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	const { DopeCanvas, Toolbar } = modules;

	return (
		<div className="h-full w-full relative flex flex-col overflow-hidden">
			<Toolbar
				pageConfig={pageConfig}
				pageCount={pageCount}
				onExecCommand={(cmd: string, val?: string) =>
					canvasHandleRef.current?.execCommand(cmd, val)
				}
				onPageConfigChange={(config: any) =>
					canvasHandleRef.current?.setPageConfig(config)
				}
			/>
			<div className="flex-1 min-h-0 relative overflow-hidden">
				<DopeCanvas
					ref={canvasHandleRef}
					html={scopedHtml}
					onContentChange={() => handleChange()}
					onPageConfigChange={(config: any) => {
						setPageConfig(config);
					}}
				/>
				<FloatingSaveIndicator
					hasChanges={hasChanges}
					isSaving={isSaving}
					onSave={handleSave}
				/>
			</div>
		</div>
	);
};

export default DopeCanvasEditor;
