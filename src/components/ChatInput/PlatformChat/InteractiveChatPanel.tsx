import { useEffect, useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineFileUrl } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";

const InlineDocumentViewer = ({ resourceId }: {resourceId: string}) => {
	const { session } = useStore();
	const { activeProject } = useStore();
	const { data: url } = useQuery({
		queryKey: ["getInlineFileUrl", session, activeProject, resourceId],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getInlineFileUrl({ session, projectId: activeProject.project_id, resourceId });
		},
	});
	return (
		<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm">
			{url && (
				<iframe 
					className="border-0"
					height="100%"
					src={url}
					width="100%"
				/>
			)}
		</div>
	);
};



const InteractiveChatPanel = () => {
	const { setSidePanel, sidePanel } = useChatStore();
	const [fileExtension, setFileExtension] = useState<string>("");

	useEffect(() => {
		if (sidePanel?.filename) {
			const parts = sidePanel.filename.split(".");
			// If there's no extension (parts.length === 1) or the last part is empty, set default to "txt"
			setFileExtension(parts.length > 1 && parts[parts.length - 1] ? parts[parts.length - 1] : "txt");
		}
	}, [sidePanel]);
    
	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "wav", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp"];

	return (
        
		<div className="h-[calc(100vh-20px)] flex flex-col bg-gray-50 rounded-lg  border border-gray-200">
			<div className="flex items-center justify-between p-2 border-b border-gray-200 bg-white rounded-t-lg">	
				<Button 
					className="h-8 w-8 hover:bg-gray-100"
					onClick={() => setSidePanel(null)}
					size="icon"
					variant="ghost"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
			<div className="flex-1 p-4 overflow-hidden">
				{sidePanel && sidePanel?.type === "sources" && 
                
                (
                	<>
                		{  inLineViewableExtensions.includes(fileExtension) && (
                			<InlineDocumentViewer resourceId={sidePanel.resourceId} />
                		)}
                		{ fileExtension === "txt" && (
                			<ResourceTextViewer resource_id={sidePanel.resourceId} />
                		)}
                	</>
                )}
				{sidePanel && sidePanel?.type === "editor" && (
					<ResourceTextViewer resource_id={sidePanel.resourceId} />
				)}
			</div>
		</div>
	);
};

export default InteractiveChatPanel;
