import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getInlineDocument, getWopiSandboxEditorUrl, getWopiStorageEditorUrl } from "@/api/folderRoutes";
import { FileImage, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSVViewer } from "./CSVViewer";
import HTMLViewer from "./HTMLViewer";
import {
	csvExtensions,
	htmlExtensions,
	imageExtensions,
	tifExtensions,
	wopiEditableExtensions,
} from "./fileExtensions";

// Collabora Online Editor Component for WOPI
const CollaboraEditor = ({
	editorUrl,
	accessToken,
	accessTokenTtl,
	resourceId,
	fileName,
}: {
	editorUrl: string;
	accessToken: string;
	accessTokenTtl: number;
	resourceId: string;
	fileName?: string;
}) => {
	const formRef = useRef<HTMLFormElement>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasSubmittedRef = useRef(false);
	const lastEditorUrlRef = useRef<string | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Generate unique iframe name based on resourceId AND fileName to prevent conflicts
	// For sandbox files, resourceId is sandbox_id which is shared, so fileName makes it unique
	const iframeName = `collabora_editor_${resourceId.replace(/[^a-zA-Z0-9]/g, "_")}_${(fileName || "").replace(/[^a-zA-Z0-9]/g, "_")}`;

	useEffect(() => {
		// Only submit the form once per unique editor URL to prevent reloading
		if (formRef.current && editorUrl && editorUrl !== lastEditorUrlRef.current) {
			lastEditorUrlRef.current = editorUrl;
			hasSubmittedRef.current = true;
			formRef.current.submit();
		}
	}, [editorUrl, accessToken]);

	// Listen for fullscreen changes (e.g., user presses Escape)
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const toggleFullscreen = useCallback(async () => {
		if (!containerRef.current) return;

		try {
			if (!document.fullscreenElement) {
				await containerRef.current.requestFullscreen();
				setIsFullscreen(true);
			} else {
				await document.exitFullscreen();
				setIsFullscreen(false);
			}
		} catch (err) {
			console.error("Fullscreen error:", err);
		}
	}, []);

	return (
		<div className="h-full w-full relative" ref={containerRef}>
			{/* Fullscreen toggle button */}
			<Button
				className="absolute bottom-2 right-2 z-10 bg-white/90 hover:bg-white shadow-md"
				onClick={toggleFullscreen}
				size="icon"
				title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
				variant="outline"
			>
				{isFullscreen ? (
					<Minimize2 className="h-4 w-4" />
				) : (
					<Maximize2 className="h-4 w-4" />
				)}
			</Button>
			{/* Hidden form to POST access token to Collabora */}
			<form
				action={editorUrl}
				encType="application/x-www-form-urlencoded"
				method="POST"
				ref={formRef}
				target={iframeName}
			>
				<input name="access_token" type="hidden" value={accessToken} />
				<input name="access_token_ttl" type="hidden" value={accessTokenTtl.toString()} />
			</form>
			<iframe
				allowFullScreen
				className="border-0 bg-white"
				height="100%"
				name={iframeName}
				ref={iframeRef}
				// sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-downloads allow-modals"
				title="Collabora Online Editor"
				width="100%"
			/>
		</div>
	);
};

export const InlineDocumentViewer = ({
	resourceId,
	fileExtension,
	isSandboxFile,
	fileName,
	lastReloadTime,
}: {
  resourceId: string;
  fileExtension: string;
  isSandboxFile?: boolean;
  fileName?: string;
  lastReloadTime?: number;
}): React.ReactNode => {
	const { session, activeProject } = useStore((state) => ({
		session: state.session,
		activeProject: state.activeProject,
	}));

	// Check if this file extension supports WOPI editing (both sandbox and storage)
	const isWopiEditable = wopiEditableExtensions.includes(fileExtension);
	const isWopiSandbox = isSandboxFile && isWopiEditable;
	const isWopiStorage = !isSandboxFile && isWopiEditable;

	const needsInlineUrl =
    !csvExtensions.includes(fileExtension) &&
    !htmlExtensions.includes(fileExtension) &&
    !isWopiEditable;

	// Fetch regular inline document URL (for non-WOPI files)
	const { data: resource } = useQuery({
		queryKey: [
			"getInlineFileUrl",
			activeProject?.project_id,
			resourceId,
			isSandboxFile,
			fileName,
			lastReloadTime,
		],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getInlineDocument({
				session,
				projectId: activeProject.project_id,
				resourceId,
				isSandboxFile,
				fileName,
			});
		},
		enabled: needsInlineUrl && !!session && !!activeProject?.project_id,
		staleTime: 30 * 1000, // Keep data fresh for 30 seconds
	});

	// Fetch WOPI editor URL for sandbox files
	const { data: wopiSandboxEditor, isLoading: wopiSandboxLoading } = useQuery({
		queryKey: [
			"getWopiSandboxEditorUrl",
			activeProject?.project_id,
			resourceId,
			fileName,
			lastReloadTime,
		],
		queryFn: () => {
			if (!session || !activeProject?.project_id || !fileName) {
				return Promise.reject("No session, active project, or file name");
			}
			return getWopiSandboxEditorUrl({
				session,
				projectId: activeProject.project_id,
				sandboxId: resourceId,
				fileName,
			});
		},
		enabled: isWopiSandbox && !!session && !!activeProject?.project_id && !!fileName,
		staleTime: 30 * 1000, // Keep data fresh for 30 seconds
	});

	// Fetch WOPI editor URL for storage (GCS) files
	const { data: wopiStorageEditor, isLoading: wopiStorageLoading } = useQuery({
		queryKey: [
			"getWopiStorageEditorUrl",
			activeProject?.project_id,
			resourceId,
			lastReloadTime,
		],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getWopiStorageEditorUrl({
				session,
				projectId: activeProject.project_id,
				resourceId,
			});
		},
		enabled: isWopiStorage && !!session && !!activeProject?.project_id,
		staleTime: 30 * 1000, // Keep data fresh for 30 seconds
	});

	// Determine which WOPI editor to use
	const wopiEditor = isWopiSandbox ? wopiSandboxEditor : wopiStorageEditor;
	const wopiLoading = isWopiSandbox ? wopiSandboxLoading : wopiStorageLoading;

	// Handle WOPI editable files (both sandbox and storage) with Collabora Online
	if (isWopiEditable) {
		if (wopiLoading) {
			return (
				<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
					<div className="flex flex-col items-center gap-2">
						<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
						<p className="text-sm text-gray-600">Loading editor...</p>
					</div>
				</div>
			);
		}

		if (wopiEditor) {
			return (
				<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
					<CollaboraEditor
						accessToken={wopiEditor.access_token}
						accessTokenTtl={wopiEditor.access_token_ttl}
						editorUrl={wopiEditor.editor_url}
						fileName={fileName}
						resourceId={resourceId}
					/>
				</div>
			);
		}

		// Fallback if WOPI editor failed to load
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<FileImage className="h-12 w-12 text-gray-400" />
					<p className="text-sm text-gray-600">Unable to load editor</p>
				</div>
			</div>
		);
	}

	if (typeof resource === "string") {
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
				<pre className="h-full w-full p-4 overflow-auto text-sm whitespace-pre-wrap break-words">
					{resource}
				</pre>
			</div>
		);
	}

	if (csvExtensions.includes(fileExtension)) {
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
				<CSVViewer
					fileName={fileName}
					isSandboxFile={isSandboxFile}
					lastReloadTime={lastReloadTime}
					resourceId={resourceId}
				/>
			</div>
		);
	}

	if (htmlExtensions.includes(fileExtension)) {
		return (
			<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
				<HTMLViewer
					fileName={fileName}
					isSandboxFile={isSandboxFile}
					lastReloadTime={lastReloadTime}
					resourceId={resourceId}
				/>
			</div>
		);
	}

	return (
		<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
			{resource && imageExtensions.includes(fileExtension) && !tifExtensions.includes(fileExtension) && (
				<img alt="Resource"
					className="max-w-full max-h-full object-contain"
					src={resource?.url}
				/>
			)}
			{resource && tifExtensions.includes(fileExtension) && (
				<div className="flex flex-col items-center justify-center p-4">
					<FileImage className="h-16 w-16 text-gray-400" />
					<p className="mt-2 text-sm text-gray-600">TIF viewer not supported in browser</p>
					<a className="mt-2 text-blue-500 hover:underline text-sm"
						download
						href={resource?.url}
					>
            Download file to view
					</a>
				</div>
			)}
			{resource && !imageExtensions.includes(fileExtension) && (
				<iframe className="border-0"
					height="100%"
					src={resource?.url}
					width="100%"
				/>
			)}
		</div>
	);
};

export default InlineDocumentViewer;


