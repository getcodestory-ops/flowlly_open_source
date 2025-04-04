import React, { useState } from "react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
// import ArtifactViewer from "./ArtifactViewer";
// import { useStore } from "@/utils/store";
import {
	File,
	FileImage,
	FileText,
	FileArchive,
	FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResourceTextViewer } from "../DocumentEditor/ResourceTextViewer";
import Image from "next/image";

function AgentMessageInteractiveView({ message }: { message: AgentMessage }) {
	// Function to get appropriate file icon based on extension
	const getFileIcon = (extension: string) => {
		const ext = extension.toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
			return <FileImage className="h-4 w-4 mr-1" />;
		} else if (["doc", "docx", "txt", "rtf", "pdf"].includes(ext)) {
			return <FileText className="h-4 w-4 mr-1" />;
		} else if (["xls", "xlsx", "csv"].includes(ext)) {
			return <FileSpreadsheet className="h-4 w-4 mr-1" />;
		} else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
			return <FileArchive className="h-4 w-4 mr-1" />;
		} else {
			return <File className="h-4 w-4 mr-1" />;
		}
	};

	const getMessageContent = (): React.ReactNode => {
		if (typeof message === "string") {
			return <MarkDownDisplay content={message} />;
		}

		if (message.response) {
			return <MarkDownDisplay content={message.response} />;
		}

		if (typeof message.content === "string") {
			return (
				<div>
					<MarkDownDisplay content={message.content} />
				</div>
			);
		}
		if ("function_response" in message) {
			const getFunctionResponse = (result: any) => {
				if (typeof result === "string" ) {
					return result;
				}
				if (typeof result === "object") {
					if (result.resource_id)
					{
						return <ResourceTextViewer resource_id={result.resource_id} />;
					}

					if (result.body) {
						if (typeof result.body === "string") {
							return <MarkDownDisplay content={result.body} />;
						}
						if (typeof result.body === "object") {
							return <MarkDownDisplay content={JSON.stringify(result.body)} />;
						}
					}
				}
				return <MarkDownDisplay content={JSON.stringify(result)} />;
			};
			return (
				<div>
					{getFunctionResponse(message.function_response?.args?.result || "")} 
				</div>
			);
		}
		if ("function_call" in message) {
			const getFunctionName = (name: string) => {
				switch (name) {
					case "run_workflow":
						return <> 
							<Image alt="Workflow started !"
								height={96}
								src="/logos/imonitguy.jpg"
								width={96}
							/>
						</>;
					case "get_running_workflows":
						return "Checking running workflows";
					case "send_data_to_workflow":
						return <div className="text-green-500 text-sm ">Continuing workflow with new data</div>;
					case "update_schedule":
						return <div className="text-green-500 text-sm ">Update Schedule</div>;
					default:
						return name;
				}
			};
			return (
				<div className="flex flex-col tex">
					{getFunctionName(message.function_call?.name || "")}
				</div>
			);
		}

		return null;
	};

	return (
		<div className="flex flex-col">
			{getMessageContent()}
			{/* Display file attachments if present */}
			{message.files && message.files.length > 0 && (
				<div className="mt-2 mb-2">
					<div className="text-xs text-gray-500 mb-1">Attachments:</div>
					<div className="flex flex-wrap gap-2">
						{message.files.map((file, index) => (
							<Badge
								className="py-1 px-2 flex items-center"
								key={index}
								variant="secondary"
							>
								{getFileIcon(file.extension || "")}
								<span className="truncate max-w-[150px]">
									{file.resource_name || file.resource_id}
								</span>
							</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default AgentMessageInteractiveView;
