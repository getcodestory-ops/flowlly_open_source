import React from "react";
import { AppWindow, ArrowUpRight } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";

interface SandboxPreviewData {
	token: string;
	port: number;
	path?: string;
}

interface SandboxPreviewProps {
	data: string;
}

const SandboxPreview: React.FC<SandboxPreviewProps> = ({ data }) => {
	const { addTab } = useChatStore();

	let previewData: SandboxPreviewData;
	try {
		previewData = JSON.parse(data);
	} catch {
		return null;
	}

	const handleOpenInTab = (): void => {
		addTab({
			isOpen: true,
			type: "sandbox_preview",
			resourceId: `sandbox-preview-${previewData.token}`,
			title: "Live App",
			sandbox_id: previewData.token,
			sandbox_path: previewData.path,
		});
	};

	return (
		<div className="flex my-1 w-full transition-all">
			<button
				className="inline-flex h-8 items-center gap-1.5  rounded-md py-0.5 px-2 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer group"
				onClick={handleOpenInTab}
				title="Open live application"
			>
				<AppWindow className="w-3.5 h-3.5 text-indigo-500" />
				<span className="font-medium text-xs text-indigo-700">
					Open App
				</span>
				<ArrowUpRight className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
			</button>
		</div>
	);
};

export default SandboxPreview;
