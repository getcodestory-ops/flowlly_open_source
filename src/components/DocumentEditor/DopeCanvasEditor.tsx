"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import FloatingSaveIndicator from "./FloatingSaveIndicator";

// Types for the lazily-loaded DopeCanvas modules
interface DopeCanvasModules {
	DopeCanvas: React.ForwardRefExoticComponent<any>;
}

interface DopeCanvasEditorProps {
	content: string;
	documentName?: string;
	isSaving?: boolean;
	onSave?: (updated: string) => void;
}

const DopeCanvasEditor: React.FC<DopeCanvasEditorProps> = ({
	content,
	documentName,
	isSaving = false,
	onSave,
}) => {
	const [modules, setModules] = useState<DopeCanvasModules | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const canvasHandleRef = useRef<any>(null);
	const lastSavedContentRef = useRef<string>(content);
	const mountTimeRef = useRef<number>(0);
	// Ensure we're on the client side
	useEffect(() => {
		setIsClient(true);
		mountTimeRef.current = Date.now();
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
				});
			} catch (error) {
				console.error("Failed to load DopeCanvas:", error);
			}
		};
		loadDopeCanvas();
	}, [isClient]);

	// Handle changes in the editor — ignore the initial onContentChange fired on mount
	const handleChange = useCallback(() => {
		if (Date.now() - mountTimeRef.current < 800) return;
		setHasChanges(true);
	}, []);

	const isFlowModeDocument = /\.(html?|xhtml)$/i.test(documentName || "");
	const decodeHtmlEntities = (value: string): string => {
		if (typeof document === "undefined") return value;
		const textarea = document.createElement("textarea");
		textarea.innerHTML = value;
		return textarea.value;
	};

	const normalizeEditedHtml = (value: string): string => {
		const raw = value || "";
		if (!raw) return raw;

		// If editor produced escaped HTML markup, decode it back.
		const hasEscapedMarkup = /&lt;(?:!doctype|html|head|body|div|table|style|script)\b/i.test(raw);
		if (hasEscapedMarkup) {
			const decoded = decodeHtmlEntities(raw);
			if (/<(?:!doctype|html|head|body|div|table)\b/i.test(decoded)) {
				return decoded;
			}
		}

		// Some editors wrap encoded full-html into a single paragraph.
		const paragraphWrapped = raw.match(/^\s*<p>([\s\S]*)<\/p>\s*$/i);
		if (paragraphWrapped?.[1]) {
			const decoded = decodeHtmlEntities(paragraphWrapped[1]);
			if (/<(?:!doctype|html|head|body)\b/i.test(decoded)) {
				return decoded;
			}
		}

		return raw;
	};

	// Save the current state
	const handleSave = useCallback(() => {
		if (!canvasHandleRef.current || !onSave) return;

		const currentHTML = canvasHandleRef.current.getHTML();
		if (currentHTML) {
			let finalHTML = normalizeEditedHtml(currentHTML);
			if (isFlowModeDocument) {
				try {
					if (typeof DOMParser !== "undefined") {
						const parser = new DOMParser();
						const sourceHtml = content || "";
						const sourceDoc = parser.parseFromString(sourceHtml, "text/html");
						const editedDoc = parser.parseFromString(finalHTML, "text/html");

						const hasSourceDocumentShell = /<html|<head|<body/i.test(sourceHtml);
						const editedBody =
							/<html|<body/i.test(finalHTML)
								? editedDoc.body?.innerHTML || ""
								: finalHTML;

						if (hasSourceDocumentShell) {
							sourceDoc.body.innerHTML = editedBody;
							const hasDocType = /<!doctype html>/i.test(sourceHtml);
							const serialized = sourceDoc.documentElement.outerHTML;
							finalHTML = hasDocType ? `<!DOCTYPE html>\n${serialized}` : serialized;
						} else {
							finalHTML = editedBody || finalHTML;
						}
					}
				} catch {
					finalHTML = normalizeEditedHtml(currentHTML);
				}
			}

			lastSavedContentRef.current = finalHTML;
			setHasChanges(false);
			onSave(finalHTML);
		}
	}, [content, isFlowModeDocument, onSave]);

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
	const canvasHtml = useMemo(() => {
		const sourceHtml = content || "";
		if (!isFlowModeDocument || !sourceHtml) {
			return sourceHtml;
		}

		try {
			if (typeof DOMParser === "undefined") {
				return sourceHtml;
			}

			const parser = new DOMParser();
			const parsed = parser.parseFromString(sourceHtml, "text/html");
			const hasDocumentShell = /<html|<head|<body/i.test(sourceHtml);
			if (!hasDocumentShell) {
				return sourceHtml;
			}

			// DopeCanvas flow mode edits content, not a full browser document.
			// Flatten head assets into the editable payload so complex HTML keeps styling.
			const headContent = parsed.head?.innerHTML?.trim() || "";
			const bodyContent = parsed.body?.innerHTML?.trim() || sourceHtml;
			return [headContent, bodyContent].filter(Boolean).join("\n");
		} catch {
			return sourceHtml;
		}
	}, [content, isFlowModeDocument]);

	// Show loading state until we're on client and modules are loaded
	if (!isClient || !modules) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	const { DopeCanvas } = modules;
	const execCommand = (command: string, value?: string) => {
		canvasHandleRef.current?.execCommand(command, value);
	};

	return (
		<div className="h-full w-full relative flex flex-col overflow-hidden">
			{!isFlowModeDocument && (
				<div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
					<button
						type="button"
						onClick={() => execCommand("bold")}
						className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-100"
					>
						B
					</button>
					<button
						type="button"
						onClick={() => execCommand("italic")}
						className="rounded border border-gray-300 px-2 py-1 text-xs italic hover:bg-gray-100"
					>
						I
					</button>
					<button
						type="button"
						onClick={() => execCommand("underline")}
						className="rounded border border-gray-300 px-2 py-1 text-xs underline hover:bg-gray-100"
					>
						U
					</button>
					<div className="mx-1 h-5 w-px bg-gray-300" />
					<button
						type="button"
						onClick={() => canvasHandleRef.current?.undo()}
						className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
					>
						Undo
					</button>
					<button
						type="button"
						onClick={() => canvasHandleRef.current?.redo()}
						className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
					>
						Redo
					</button>
					<div className="mx-1 h-5 w-px bg-gray-300" />
					<button
						type="button"
						onClick={() => canvasHandleRef.current?.insertPageBreak()}
						className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
					>
						Page Break
					</button>
				</div>
			)}
			<div className="flex-1 min-h-0 relative overflow-hidden">
				<DopeCanvas
					ref={canvasHandleRef}
					html={canvasHtml}
					renderMode={isFlowModeDocument ? "flow" : "page"}
					rendermode={isFlowModeDocument ? "flow" : "page"}
					onContentChange={() => handleChange()}
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
