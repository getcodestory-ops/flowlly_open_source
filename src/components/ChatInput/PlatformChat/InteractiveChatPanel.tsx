import { useEffect, useState } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { getInlineDocument } from "@/api/folderRoutes";
import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { X, FileText, FileImage, FileAudio, FileVideo, FileCode, File, Pencil } from "lucide-react";
import { ResourceTextViewer } from "@/components/DocumentEditor/ResourceTextViewer";
import RunningLogViewer from "@/components/WorkflowComponents/RunningLogViewer";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff"];
const tifExtensions = ["tif", "tiff"];
const htmlExtensions = ["html", "htm"];
const docExtensions = ["doc", "docx"];

const InlineDocumentViewer = ({ resourceId, fileExtension }: {resourceId: string, fileExtension: string}) : React.ReactNode => {
	const { session } = useStore();
	const { activeProject } = useStore();
	const { data: resource } = useQuery({
		queryKey: ["getInlineFileUrl", session, activeProject, resourceId],
		queryFn: () => {
			if (!session || !activeProject?.project_id) {
				return Promise.reject("No session or active project");
			}
			return getInlineDocument({ session, projectId: activeProject.project_id, resourceId });
		},
	});
	return (
		<div className="h-full w-full rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
			{resource && imageExtensions.includes(fileExtension) && !tifExtensions.includes(fileExtension) && (
				<img 
					alt="Resource" 
					className="max-w-full max-h-full object-contain" 
					src={resource?.url}
				/>
			)}
			{resource && tifExtensions.includes(fileExtension) && (
				<div className="flex flex-col items-center justify-center p-4">
					<FileImage className="h-16 w-16 text-gray-400" />
					<p className="mt-2 text-sm text-gray-600">TIF viewer not supported in browser</p>
					<a 
						className="mt-2 text-blue-500 hover:underline text-sm"
						download
						href={resource?.url}
					>
						Download file to view
					</a>
				</div>
			)}
			{resource && docExtensions.includes(fileExtension) && (
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
			{resource && htmlExtensions.includes(fileExtension) && (
				<iframe 
					className="border-0 bg-white"
					height="100%"
					sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
					src={resource?.url}
					title="HTML Document"
					width="100%"
				/>
			)}
			{resource && !imageExtensions.includes(fileExtension) && !htmlExtensions.includes(fileExtension) && !docExtensions.includes(fileExtension) && (
				
				<iframe 
					className="border-0"
					height="100%"
					src={resource?.url}
					width="100%"
				/>
			)}
		</div>
	);
};

const getFileIcon = (extension: string) : React.ReactNode => {
	const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff"];
	const audioExts = ["mp3", "wav", "ogg", "oga"];
	const videoExts = ["mp4", "webm"];
	const codeExts = ["js", "ts", "jsx", "tsx", "html", "htm", "css", "json", "md"];
	const documentExts = ["pdf", "doc", "docx"];

	if (imageExts.includes(extension)) return <FileImage className="h-4 w-4" />;
	if (audioExts.includes(extension)) return <FileAudio className="h-4 w-4" />;
	if (videoExts.includes(extension)) return <FileVideo className="h-4 w-4" />;
	if (codeExts.includes(extension)) return <FileCode className="h-4 w-4" />;
	if (documentExts.includes(extension)) return <FileText className="h-4 w-4" />;
	return <File className="h-4 w-4" />;
};

const InteractiveChatPanel = () : React.ReactNode => {
	const { setSidePanel, sidePanel } = useChatStore();
	const [fileExtension, setFileExtension] = useState<string>("");
	const [viewMode, setViewMode] = useState<"original" | "text">("original");

	useEffect(() => {
		if (sidePanel?.filename) {
			const parts = sidePanel.filename.split(".");
			// If there's no extension (parts.length === 1) or the last part is empty, set default to "txt"
			setFileExtension(parts.length > 1 && parts[parts.length - 1] ? parts[parts.length - 1] : "txt");
		}
	}, [sidePanel]);
    
	const inLineViewableExtensions = ["pdf", "oga", "wav", "mp3", "mp4", "webm", "ogg", "wav", "jpg", "jpeg", "png", "gif", "svg", "ico", "webp", "tif", "tiff", "csv", "json", "xml", "html", ".xlsx", ".docx", ".doc"];

	return (
        
		<div className="h-[calc(100vh-20px)] flex flex-col bg-gray-50 rounded-lg  border border-gray-200 ">
			<div className="flex items-center gap-2 p-2 bg-white rounded-t-lg px-4">	
				<Button 
					className="h-8 w-8 hover:bg-gray-100"
					onClick={() => setSidePanel(null)}
					size="icon"
					variant="ghost"
				>
					<X className="h-4 w-4" />
				</Button>
				{getFileIcon(fileExtension)}
				<span className="text-sm font-medium">{sidePanel?.filename}</span>
				<div className="flex-1" />
				<Button 
					className="gap-2"
					onClick={() => setViewMode(viewMode === "original" ? "text" : "original")}
					variant="ghost"
				>
					{viewMode === "original" ? <Pencil className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
					{viewMode === "original" ? "View and Edit File Content" : "View Original"}
				</Button>
			</div>
			<div className="flex-1 p-4 overflow-auto">
				{sidePanel && sidePanel?.type === "sources" && 
                
                (
                	<>
                		{  inLineViewableExtensions.includes(fileExtension) && (
                			<>
                				{viewMode === "original" ? (
                					<InlineDocumentViewer 
                						fileExtension={fileExtension} 
                						resourceId={sidePanel.resourceId}
                					/>
                				) : (
                					<ResourceTextViewer resource_id={sidePanel.resourceId} />
                				)}
                			</>
                		)}
                		{ fileExtension === "txt" && (
                			<ResourceTextViewer resource_id={sidePanel.resourceId} />
                		)}
                	</>
                )}
				{sidePanel && sidePanel?.type === "editor" && (
					<ResourceTextViewer resource_id={sidePanel.resourceId} /> 
				)}
				{sidePanel && sidePanel?.type === "log" && (
					<RunningLogViewer logId={sidePanel.resourceId} />
				)}
			</div>
		</div>
	);
};

export default InteractiveChatPanel;
