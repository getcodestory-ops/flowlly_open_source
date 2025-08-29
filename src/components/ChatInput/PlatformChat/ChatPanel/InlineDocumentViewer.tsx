import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getInlineDocument } from "@/api/folderRoutes";
import { FileImage } from "lucide-react";
import { CSVViewer } from "./CSVViewer";
import HTMLViewer from "./HTMLViewer";
import {
	csvExtensions,
	htmlExtensions,
	imageExtensions,
	microsoftExtensions,
	tifExtensions,
} from "./fileExtensions";

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

	const needsInlineUrl =
    !csvExtensions.includes(fileExtension) &&
    !htmlExtensions.includes(fileExtension);

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
			{resource && microsoftExtensions.includes(fileExtension) && (
				<div className="h-full w-full">
					<iframe
						className="border-0 bg-white"
						height="100%"
						src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource?.url)}`}
						title="Word Document"
						width="100%"
					/>
				</div>
			)}
			{resource &&
        !imageExtensions.includes(fileExtension) &&
        !microsoftExtensions.includes(fileExtension) && (
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


