import React, { useEffect } from "react";
import ChatComponent from "@/components/ChatInput/ChatComponet";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useChatStore } from "@/hooks/useChatStore";

export const ChatContent = (): React.ReactNode => {
	const { currentResult, currentGraph } = useWorkflow();
	const { setChatInput } = useChatStore();
	
	useEffect(() => {
		if (currentResult && currentResult.nodes) {
			// Extract meeting information
			const meetingName = currentResult.name || "Meeting";
			const meetingDate = currentResult.run_time ? new Date(currentResult.run_time).toLocaleDateString() : "Unknown date";
			
			// Find transcription from nodes
			const transcribeNode = currentResult.nodes.find((node) => node.id === "transcribe_meeting");
			const transcription = transcribeNode ? transcribeNode.output : "No transcription available";
			
			// Find meeting minutes resource ID
			const minutesNode = currentResult.nodes.find((node) => node.id === "save_minutes_in_project_documents");
			const minutesResourceId = minutesNode?.output?.resource_id || "No minutes saved";
			
			// Extract action items
			const actionItemsNode = currentResult.nodes.find((node) => node.id === "determine_action_items");
			let actionItemsContext = "No action items found";
			
			if (actionItemsNode && Array.isArray(actionItemsNode.output)) {
				const actionData = actionItemsNode.output[0];
				if (actionData) {
					const additions = actionData.activity_addition || [];
					const modifications = actionData.activity_modification || [];
					const deletions = actionData.activity_deletion || [];
					
					const actionItemsList = [];
					
					// Add new activities
					if (additions.length > 0) {
						actionItemsList.push(`New Activities Added: ${additions.map((item: any) => `- ${item.name}: ${item.description}`).join(", ")}`);
					}
					
					// Add modified activities
					if (modifications.length > 0) {
						actionItemsList.push(`Activities Modified: ${modifications.map((item: any) => `- ${item.revision?.name || "Unnamed"}: ${item.revision?.reason || "No reason provided"}`).join(", ")}`);
					}
					
					// Add deleted activities
					if (deletions.length > 0) {
						actionItemsList.push(`Activities Deleted: ${deletions.map((item: any) => `- ${item.name}: ${item.reason || "No reason provided"}`).join(", ")}`);
					}
					
					actionItemsContext = actionItemsList.length > 0 ? actionItemsList.join(". ") : "No action items found";
				}
			}
			
			// Build comprehensive context
			const context = `:::context
Meeting "${meetingName}" took place on ${meetingDate}. The transcription of the meeting is: ${transcription}. The minutes of the meeting are saved in document with resource ID ${minutesResourceId}. Following action items were discussed: ${actionItemsContext}.
:::`;
			
			setChatInput(context);
		} else {
			setChatInput("Ask questions about this workflow");
		}
	}, [currentResult, setChatInput]);

	return (
		<>
	
			<div className="flex-1 pb-6 h-full overflow-auto" style={{ maxHeight: "calc(100%)" }}>
				{currentResult ? (
					<ChatComponent />
				) : (
					<div className="bg-muted p-4 rounded-lg">
						<p className="text-muted-foreground">
								No workflow selected to answer questions about
						</p>
					</div>
				)}
			</div>
		</>
	);
};