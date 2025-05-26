import React, { useEffect } from "react";
import { AgentMessage } from "@/types/agentChats";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";

import {
	FileText,
	XIcon,
	Eye,
	Database,
	EyeOff
} from "lucide-react";

import Image from "next/image";
import ContextSourceViewer from "../Folder/ContextSourceViewer";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";
import AttachmentViewer from "./AttachmentViewer";


function AgentMessageInteractiveView({ id, message }: { id?: string, message: AgentMessage | string }) : React.ReactNode {
	const { setSidePanel, setCollapsed, sidePanel } = useChatStore();
	const { setDocumentDisplayMap, documentDisplayMap } = useChatStore();
	useEffect(() => {
		if (!id || typeof message !== "object" || !("function_response" in message) ||
        !message.function_response || typeof message.function_response !== "object" ||
        !message.function_response.args || typeof message.function_response.args !== "object" ||
        !message.function_response.args.result || typeof message.function_response.args.result !== "object" ||
        !("resource_id" in message.function_response.args.result)) {
			return;
		}

		const result = message.function_response.args.result as any; // Cast to any for easier access
		const newResourceId = result.resource_id as string;
		const newFilename = (result.resource_name as string) || (result.name as string) || (sidePanel?.filename) || "";

		setDocumentDisplayMap(newResourceId || "", id);

		if (sidePanel?.isOpen) {
			if (sidePanel.resourceId === newResourceId ) {
				setSidePanel(null);
			}
		}
	}, [message]);


	const setEditorSidePanel = (resource_id: string, filename: string, type: "editor" | "sources" | "log" = "editor") : void => {
		setSidePanel({
			isOpen: true,
			type: type,
			resourceId: resource_id,
			filename: filename,
		});
		setCollapsed(true);
	};

	const getSources = (sources: {filename: string, resource_id: string}[]) => {
		return (
			<div className="flex flex-col gap-2  w-1/2">
				<div className="text-xs text-gray-500 mb-1">Sources:</div>
				<div className="flex flex-wrap gap-2 ">
					{sources.map((source) => (
						<ContextSourceViewer key={source.resource_id} sources={source} />
					))}
				</div>
			</div>
		);
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
						return (
							<>
								{
									result.body && (
										<MarkDownDisplay content={result.body} />
									)
								}
								{sidePanel?.type === "editor" && sidePanel?.resourceId === result.resource_id && (
									<div className="flex justify-start ml-4 max-w-4xl mx-auto ">
										<Button className="flex items-center gap-2"
											onClick={() => {
												setSidePanel(null);
											}}
											variant="outline"
										>
											<EyeOff className="h-4 w-4 border border-gray-300 rounded-md p-0.5 " />
											<span>Close Document Panel</span>	
										</Button>
									</div>
								)}
								{ sidePanel?.resourceId !== result.resource_id && (
									<>
										<div className="flex justify-start ml-4 max-w-4xl mx-auto">
											<Button className="flex items-center gap-2 group"
												onClick={() => {
													setEditorSidePanel(result.resource_id, result.resource_name);
												}}
												variant="outline"
											>
												<FileText className="h-4 w-4 text-gray-400" />
												<span>Open Document</span>
												<Eye className="h-4 w-4 border border-gray-300 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />	
											</Button>
										</div>
									</>
								)}
								
								
							</>
						);
					}
					if (result.log_id) {
						return (
							<>
								{result.body.response && (
									<MarkDownDisplay content={result.body.response} />
								)}
								{
									sidePanel?.type === "log" && sidePanel?.resourceId === result.log_id && (
										<div className="flex justify-end max-w-4xl mx-auto">
											<Button className="flex items-center gap-2 w-64"
												onClick={() => {
													setSidePanel(null);
												}}
												variant="outline"
											>
											Close log
												<XIcon className="h-4 w-4" />
											</Button>
										</div>
									)}
								{
									sidePanel?.type !== "log" && (
										<div className="flex justify-end max-w-4xl mx-auto  ">
											<Button className="flex items-center gap-2 group min-w-64 "
												onClick={() => {
													setEditorSidePanel(result.log_id, result.log_name, "log");
												}}
												variant="outline"
											>
												<Database className="h-4 w-4 text-gray-400" />
												<span>{result.log_name}</span>
												<Eye className="h-4 w-4 border border-gray-300 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
											</Button>
										</div>
									)}	
							</>
						);
					}

					if (result.body) {
						if (typeof result.body === "string") {
							return<>
								<MarkDownDisplay content={result.body} />
								<div className="flex justify-end">
									{result.sources && getSources(result.sources)}
								</div>
							</>; 
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
						return <> 
							<Image alt="Workflow Continued !"
								height={96}
								src="/logos/continueworkguy.jpg"
								width={96}
							/>
						</>;
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
			{typeof message !== "string" && message.files && message.files.length > 0 && (
				<AttachmentViewer files={message.files} />
			)}
		</div>
	);
}

const MemoizedAgentMessageInteractiveView = React.memo(AgentMessageInteractiveView);

// Add display name for better debugging
MemoizedAgentMessageInteractiveView.displayName = "AgentMessageInteractiveView";

export default MemoizedAgentMessageInteractiveView;
