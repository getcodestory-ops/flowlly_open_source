import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { fetchResource } from "@/api/folderRoutes";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { useStorageTextFileSave } from "../DocumentEditor/useStorageTextSave";
import { useSandboxFileSave } from "../DocumentEditor/useSandboxFileSave";
import LoaderAnimation from "../Animations/LoaderAnimation";
import CodeEditor from "../DocumentEditor/CodeEditor";

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
	const storageFileSave = useStorageTextFileSave(resource_id);
	const sandboxFileSave = useSandboxFileSave(resource_id, fileName);
	
	const { onSubmit, isPending } = isSandboxFile ? sandboxFileSave : storageFileSave;

	const { data, isLoading, error } = useQuery({
		queryKey: ["aiJobResource", resource_id, isSandboxFile, fileName, lastReloadTime],
		queryFn: () =>
			fetchResource(session, activeProject?.project_id, resource_id, isSandboxFile, fileName),
		staleTime: 0, // Always fetch fresh data
	});
	

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
				return data.metadata.content;
			}
		} else {
			// For regular storage files, always use metadata.content
			if (data?.metadata?.content !== undefined) {
				return data.metadata.content;
			}
		}
		return null;
	};
	

	const content = getContent();
	const documentName = data?.file_name || fileName || "Untitled";
	const isCodeFile = (name?: string) => {
		const lower = (name || "").toLowerCase();
		// Exclude .md so it renders in TipTap ContentEditor
		return [".py", ".js", ".ts", ".tsx", ".css", ".json", ".jsonl", ".txt"].some((ext) => lower.endsWith(ext));
	};

	return (
		<div className="h-full ">
			{isLoading ? (
				<div className="flex justify-center items-center h-full">
					<LoaderAnimation />
				</div>
			) : content !== null ? (
				<div className="h-full">
					{isCodeFile(documentName) ? (
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
