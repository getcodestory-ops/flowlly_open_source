import { FileImage, FileText, FileSpreadsheet, FileArchive, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/hooks/useChatStore";

const ContextSourceViewer = ({ sources }: {sources: {filename: string, resource_id: string}}): React.ReactNode => {
	const { setCollapsed } = useChatStore();
	const { setSidePanel } = useChatStore();


	const setSourceSidePanel = async(): Promise<void | null> => {
		setSidePanel({
			isOpen: true,
			type: "sources",
			resourceId: sources.resource_id,
			filename: sources.filename,
		});
		setCollapsed(true);
	};

	const getFileIcon = (extension: string): React.ReactNode => {
		const ext = extension.toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"].includes(ext)) {
			return <FileImage className="h-4 w-4 mr-1" />;
		} else if (["doc", "docx", "txt", "rtf", "pdf", ".doc", ".docx", ".txt", ".rtf", ".pdf"].includes(ext)) {
			return <FileText className="h-4 w-4 mr-1" />;
		} else if (["xls", "xlsx", "csv", ".xls", ".xlsx", ".csv"].includes(ext)) {
			return <FileSpreadsheet className="h-4 w-4 mr-1" />;
		} else if (["zip", "rar", "7z", "tar", "gz", ".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) {
			return <FileArchive className="h-4 w-4 mr-1" />;
		} else {
			return <File className="h-4 w-4 mr-1" />;
		}
	};

	return (
		<div>
			<Badge className="cursor-pointer"
				onClick={setSourceSidePanel}
				variant="secondary"
			>
				{getFileIcon(sources.filename.split(".").pop() || "")}
				<span className="truncate max-w-[150px]">
					{sources.filename}
				</span>
			</Badge>
			
		</div>
	);
};

export default ContextSourceViewer;


