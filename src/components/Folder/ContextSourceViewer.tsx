import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/hooks/useChatStore";
import { FileIconSvg, getFileConfig } from "@/utils/fileIconConfig";
import { cn } from "@/lib/utils";

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

	const extension = sources.filename.split(".").pop() || "";
	const config = getFileConfig(extension);

	return (
		<div>
			<Badge className="cursor-pointer gap-1.5"
				onClick={setSourceSidePanel}
				variant="secondary"
			>
				<span className={cn("flex items-center justify-center w-4 h-4 rounded", config.bg, config.color)}>
					<FileIconSvg className="h-4 w-4" iconKey={config.iconKey} />
				</span>
				<span className="truncate max-w-[150px]">
					{sources.filename}
				</span>
			</Badge>
			
		</div>
	);
};

export default ContextSourceViewer;


