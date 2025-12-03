import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getInlineDocument, getWopiSandboxEditorUrl, getWopiStorageEditorUrl } from "@/api/folderRoutes";
import { FileImage, Loader2 } from "lucide-react";
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
}: {
	editorUrl: string;
	accessToken: string;
	accessTokenTtl: number;
}) => {
	const formRef = useRef<HTMLFormElement>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		// Submit the form to load the Collabora editor
		if (formRef.current) {
			formRef.current.submit();
		}
	}, [editorUrl, accessToken]);

	return (
		<div className="h-full w-full relative">
			{/* Hidden form to POST access token to Collabora */}
			<form
				action={editorUrl}
				encType="application/x-www-form-urlencoded"
				method="POST"
				ref={formRef}
				target="collabora_editor"
			>
				<input name="access_token" type="hidden" value={accessToken} />
				<input name="access_token_ttl" type="hidden" value={accessTokenTtl.toString()} />
			</form>
			<iframe
				allowFullScreen
				className="border-0 bg-white"
				height="100%"
				name="collabora_editor"
				ref={iframeRef}
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox allow-downloads allow-modals"
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
	const { session } = useStore();
	const { activeProject } = useStore();

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
			session,
			activeProject,
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
	});

	// Fetch WOPI editor URL for sandbox files
	const { data: wopiSandboxEditor, isLoading: wopiSandboxLoading } = useQuery({
		queryKey: [
			"getWopiSandboxEditorUrl",
			session,
			activeProject,
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
	});

	// Fetch WOPI editor URL for storage (GCS) files
	const { data: wopiStorageEditor, isLoading: wopiStorageLoading } = useQuery({
		queryKey: [
			"getWopiStorageEditorUrl",
			session,
			activeProject,
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


