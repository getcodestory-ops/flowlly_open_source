import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import { FileText } from "lucide-react";

export const HTMLViewer = ({
	resourceId,
	isSandboxFile,
	fileName,
	lastReloadTime,
}: {
  resourceId: string;
  isSandboxFile?: boolean;
  fileName?: string;
  lastReloadTime?: number;
}) => {
	const { session } = useStore();
	const { activeProject } = useStore();

	const { data: resource, isLoading, isError } = useQuery({
		queryKey: [
			"htmlResource",
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
			return fetchResource(
				session,
				activeProject.project_id,
				resourceId,
				isSandboxFile,
				fileName,
			);
		},
		enabled: !!session && !!activeProject?.project_id && !!resourceId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-sm text-gray-600">Loading HTML...</div>
			</div>
		);
	}

	let htmlContent: string | null = null;
	let cssContent: string | null = null;
	let headerContent: string | null = null;

	if (isSandboxFile && typeof resource === "string") {
		htmlContent = resource;
	} else if ((resource as any)?.metadata?.content) {
		htmlContent = (resource as any).metadata.content;
		cssContent = (resource as any).metadata.style;
		// Support both 'header' and 'headers' for backward compatibility
		headerContent = (resource as any).metadata.header || (resource as any).metadata.headers;
	}

	if (isError || !htmlContent) {
		return (
			<div className="flex flex-col items-center justify-center p-8">
				<FileText className="h-16 w-16 text-gray-400" />
				<p className="mt-2 text-sm text-gray-600">Failed to load HTML file</p>
			</div>
		);
	}

	const createEnhancedHtmlContent = (): string => {
		if (!htmlContent) return "";
		let workingHtmlContent = htmlContent;
		let headContent = "";
		console.log(htmlContent);
		try {
			const hasBaseTag = /<base\s[^>]*href=/i.test(workingHtmlContent);
			const baseHref = typeof document !== "undefined" ? document.baseURI : "/";
			if (!hasBaseTag && baseHref) {
				headContent += `\n<base href="${baseHref}">\n`;
			}
		} catch {}
		if (cssContent) {
			headContent += `\n<style type="text/css">\n${cssContent}\n</style>\n`;
		}
		if (headerContent) {
			headContent += `${headerContent}\n`;
		}

		if (headContent) {
			const headRegex = /<head[^>]*>/i;
			const headMatch = workingHtmlContent.match(headRegex);
			if (headMatch) {
				const headEndIndex = headMatch.index! + headMatch[0].length;
				workingHtmlContent =
          workingHtmlContent.slice(0, headEndIndex) +
          headContent +
          workingHtmlContent.slice(headEndIndex);
			} else {
				const htmlRegex = /<html[^>]*>/i;
				const htmlMatch = workingHtmlContent.match(htmlRegex);
				if (htmlMatch) {
					const htmlEndIndex = htmlMatch.index! + htmlMatch[0].length;
					const headSection = `\n<head>${headContent}</head>\n`;
					workingHtmlContent =
            workingHtmlContent.slice(0, htmlEndIndex) +
            headSection +
            workingHtmlContent.slice(htmlEndIndex);
				} else {
					workingHtmlContent = `<!DOCTYPE html>\n<html>\n<head>${headContent}</head>\n<body>\n${workingHtmlContent}\n</body>\n</html>`;
				}
			}
		}
		return workingHtmlContent;
	};

	const enhancedHtmlContent = createEnhancedHtmlContent();
	const sandboxAttrs = /<script[^>]+src=/i.test(enhancedHtmlContent)
		? "allow-same-origin allow-scripts"
		: "allow-same-origin";

	return (
		<div className="w-full h-full overflow-auto">
			<iframe
				className="border-0 bg-white w-full h-full"
				sandbox={sandboxAttrs}
				srcDoc={enhancedHtmlContent}
				title="HTML Document"
			/>
		</div>
	);
};

export default HTMLViewer;


