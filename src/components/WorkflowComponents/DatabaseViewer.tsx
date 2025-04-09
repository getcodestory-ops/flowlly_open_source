"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { useWorkflow } from "@/hooks/useWorkflow";
import RunningLogViewer from "./RunningLogViewer";

export const DatabaseViewer = (): React.ReactNode => {
	const { setSelectedEventResourceId, selectedEventResourceId } = useWorkflow();

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex items-center gap-4 p-4 border-b">
				<Tooltipped tooltip="Back to Workflows">
					<Button
						onClick={() => {
							setSelectedEventResourceId(null);
						}}
						size="icon"
						variant="ghost"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Tooltipped>
				<h2 className="text-xl font-semibold"> Resource Logs </h2>
			</div>
			<div className="p-4 max-h-[calc(100vh-100px)] overflow-auto">
				{selectedEventResourceId && (
					<RunningLogViewer logId={selectedEventResourceId} />
				)}
			</div>
		</div>
	);
}; 