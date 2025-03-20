import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";


import PlatformChatComponent from "@/components/ChatInput/PlatformChat/PlatformChatComponent";
import { useWorkflow } from "@/hooks/useWorkflow";

export const ChatContent = (): React.ReactNode => {
	const { currentResult, currentGraph } = useWorkflow();
	return (
		<>
			<Card className="h-full flex flex-col border-0 shadow-none">
				<CardHeader>
					<CardTitle>Ask about this workflow</CardTitle>
					<CardDescription>
						Get help and information about this workflow
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 pb-6">
					{currentResult ? (
						<div className="h-[full] border rounded-md">
							<PlatformChatComponent
								chatTarget="workflow"
								folderId={currentResult.id}
								folderName={currentGraph?.name || ""}
							/>
						</div>
					) : (
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-muted-foreground">
								No workflow selected to answer questions about
							</p>
						</div>
					)}
				</CardContent>
			</Card></>
	);
};