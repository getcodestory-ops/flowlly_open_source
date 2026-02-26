import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";
import { useSandboxFileSave } from "../DocumentEditor/useSandboxFileSave";
import LoaderAnimation from "../Animations/LoaderAnimation";
import CodeEditor from "../DocumentEditor/CodeEditor";
import ExcalidrawEditor from "../DocumentEditor/ExcalidrawEditor";
import DopeCanvasEditor from "../DocumentEditor/DopeCanvasEditor";

export function ResourceTextViewer({ 
	resource_id, 
	showComments = false, 
	isSandboxFile = false, 
	fileName,
	lastReloadTime, 
}: { 
	resource_id: string, 
	showComments?: boolean,
	isSandboxFile?: boolean,
	fileName?: string,
	lastReloadTime?: number 
}) {
	const activeProject = useStore((state) => state.activeProject);
	const session = useStore((state) => state.session);
	
	// Use appropriate save hook based on file type
	const storageFileSave = useStorageTextFileSave(resource_id, fileName);
	const sandboxFileSave = useSandboxFileSave(resource_id, fileName);
	
	const { onSubmit, isPending } = isSandboxFile ? sandboxFileSave : storageFileSave;

	const isHtmlFile = (name?: string) => {
		const lower = (name || "").toLowerCase();
		return lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".xhtml");
	};

	const buildEnhancedHtml = (
		htmlContent: string,
		cssContent?: string,
		headerContent?: string,
	): string => {
		let workingHtmlContent = htmlContent;
		let headContent = "";

		try {
			const hasBaseTag = /<base\s[^>]*href=/i.test(workingHtmlContent);
			const baseHref = typeof document !== "undefined" ? document.baseURI : "/";
			if (!hasBaseTag && baseHref) {
				headContent += `\n<base href="${baseHref}">\n`;
			}
		} catch {
			// Ignore base URI issues in non-browser contexts.
		}

		if (cssContent) {
			headContent += `\n<style type="text/css">\n${cssContent}\n</style>\n`;
		}
		if (headerContent) {
			headContent += `${headerContent}\n`;
		}

		const hasHtmlTag = /<html[^>]*>/i.test(workingHtmlContent);
		const hasHeadTag = /<head[^>]*>/i.test(workingHtmlContent);

		if (!headContent) {
			// Keep existing full HTML intact, but normalize HTML fragments to a full document.
			return hasHtmlTag || hasHeadTag
				? workingHtmlContent
				: `<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
		}

		const headRegex = /<head[^>]*>/i;
		const headMatch = workingHtmlContent.match(headRegex);
		if (headMatch) {
			const headEndIndex = headMatch.index! + headMatch[0].length;
			return (
				workingHtmlContent.slice(0, headEndIndex) +
				headContent +
				workingHtmlContent.slice(headEndIndex)
			);
		}

		const htmlRegex = /<html[^>]*>/i;
		const htmlMatch = workingHtmlContent.match(htmlRegex);
		if (htmlMatch) {
			const htmlEndIndex = htmlMatch.index! + htmlMatch[0].length;
			const headSection = `\n<head>${headContent}</head>\n`;
			return (
				workingHtmlContent.slice(0, htmlEndIndex) +
				headSection +
				workingHtmlContent.slice(htmlEndIndex)
			);
		}

		return `<!DOCTYPE html>\n<html>\n<head>${headContent}</head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
	};

	// Using standardized query key: "resource" prefix for all file content fetches
	const { data, isLoading, error } = useQuery({
		queryKey: ["resource", activeProject?.project_id, resource_id, isSandboxFile ? "sandbox" : "storage", fileName, lastReloadTime],
		queryFn: () =>
			fetchResource(session, activeProject?.project_id, resource_id, isSandboxFile, fileName),
		staleTime: 30 * 1000, // Keep data fresh for 30 seconds
		enabled: !!session && !!activeProject?.project_id,
	});
	

	const documentName = data?.file_name || fileName || "Untitled";

	// For sandbox files, the backend might return content directly as a string
	// For regular files, content is in data.metadata.content
	const getContent = () => {
		if (isSandboxFile) {
			// For sandbox files, check if data is a string directly
			if (typeof data === "string") {
				return data;
			}
			// Or if it's in the standard metadata structure
			if (data?.metadata?.content !== undefined) {
				if (isHtmlFile(documentName) && typeof data.metadata.content === "string") {
					return buildEnhancedHtml(
						data.metadata.content,
						data?.metadata?.style,
						data?.metadata?.header || data?.metadata?.headers,
					);
				}
				return data.metadata.content;
			}
		} else {
			// For regular storage files, always use metadata.content
			if (data?.metadata?.content !== undefined) {
				if (isHtmlFile(documentName) && typeof data.metadata.content === "string") {
					return buildEnhancedHtml(
						data.metadata.content,
						data?.metadata?.style,
						data?.metadata?.header || data?.metadata?.headers,
					);
				}
				return data.metadata.content;
			}
		}
		return null;
	};
	

	const content = getContent();
	const isCodeFile = (name?: string) => {
		const lower = (name || "").toLowerCase();
		// Exclude .md so it renders in TipTap ContentEditor
		return [".py", ".js", ".ts", ".tsx", ".css", ".json", ".jsonl", ".txt"].some((ext) => lower.endsWith(ext));
	};
	const isExcalidrawFile = (name?: string) => {
		const lower = (name || "").toLowerCase();
		return lower.endsWith(".excalidraw");
	};
	const isDopeCanvasFile = (name?: string) => {
		const lower = (name || "").toLowerCase();
		return (
			lower.endsWith(".dop") ||
			lower.endsWith(".html") ||
			lower.endsWith(".htm") ||
			lower.endsWith(".xhtml")
		);
	};

	return (
		<div className="h-full ">
			{isLoading ? (
				<div className="flex justify-center items-center h-full">
					<LoaderAnimation />
				</div>
			) : content !== null ? (
				<div className="h-full">
				{isDopeCanvasFile(documentName) ? (
					<DopeCanvasEditor
						content={typeof content === "string" ? content : String(content)}
						documentName={documentName}
						isSaving={isPending}
						onSave={(updated) => onSubmit(updated)}
					/>
				) : isExcalidrawFile(documentName) ? (
					<ExcalidrawEditor
						content={typeof content === "string" ? content : String(content)}
						documentName={documentName}
						isSaving={isPending}
						onSave={(updated) => onSubmit(updated)}
					/>
					) : isCodeFile(documentName) ? (
						<CodeEditor
							content={typeof content === "string" ? content : String(content)}
							documentName={documentName}
							isSaving={isPending}
							onSave={(updated) => onSubmit(updated)}
						/>
					) : (
						<ContentEditor
							content={content}
							documentId={resource_id}
							documentName={documentName}
							projectAccessId={activeProject?.project_id}
							saveFunction={onSubmit}
							showComments={showComments}
						/>
					)}
				</div>
			) : (
				<div className="flex justify-center items-center h-full">
					<div className="text-center">
						<p className="text-gray-500">No content available</p>
						{error && (
							<p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
