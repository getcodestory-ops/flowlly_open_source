import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import { MinutesHTMLViewer } from "./MinutesHTMLViewer";
import { htmlExtensions } from "@/components/ChatInput/PlatformChat/ChatPanel/fileExtensions";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import { FileText } from "lucide-react";

interface MinutesContentViewerProps {
	resource_id: string;
	showComments?: boolean;
	onTimestampClick?: (seconds: number) => void;
}

export const MinutesContentViewer: React.FC<MinutesContentViewerProps> = ({
	resource_id,
	showComments = false,
	onTimestampClick,
}) => {
	const activeProject = useStore((state) => state.activeProject);
	const session = useStore((state) => state.session);

	const { data, isLoading, error } = useQuery({
		queryKey: ["minutesResource", resource_id],
		queryFn: () =>
			fetchResource(session, activeProject?.project_id, resource_id, false),
		staleTime: 0, // Always fetch fresh data
		enabled: !!session && !!activeProject?.project_id && !!resource_id,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<LoaderAnimation />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex justify-center items-center h-full text-gray-500">
				<div className="text-center">
					<FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
					<p>Failed to load minutes</p>
					{error && (
						<p className="text-red-500 text-sm mt-2">Error: {(error as Error).message}</p>
					)}
				</div>
			</div>
		);
	}

	// Check if resource is HTML by checking file extension
	const fileExtension = data?.metadata?.extension?.toLowerCase()?.replace(".", "") || "";
	const fileName = data?.file_name || "";
	
	// Check if it's an HTML file
	const isHTML = htmlExtensions.includes(fileExtension) || 
		htmlExtensions.some(ext => fileName.toLowerCase().endsWith(`.${ext}`));

	if (isHTML) {
		// Extract HTML content from the already-fetched data
		let htmlContent: string | null = null;
		let cssContent: string | null = null;
		let headerContent: string | null = null;

		if (data?.metadata?.content) {
			htmlContent = data.metadata.content;
			cssContent = data.metadata.style;
			headerContent = data.metadata.header || data.metadata.headers;
		}

		if (htmlContent) {
			return (
				<div className="h-full ">
					<MinutesHTMLViewer
						htmlContent={htmlContent}
						cssContent={cssContent || undefined}
						headerContent={headerContent || undefined}
						onTimestampClick={onTimestampClick}
					/>
				</div>
			);
		}
	}

	// For non-HTML files, use ResourceTextViewer
	return (
		<div className="h-full">
			<ResourceTextViewer 
				resource_id={resource_id} 
				showComments={showComments}
			/>
		</div>
	);
};

export default MinutesContentViewer;

