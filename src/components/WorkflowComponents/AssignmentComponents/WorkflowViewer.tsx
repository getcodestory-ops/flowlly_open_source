"use client";
import React, { useState } from "react";
import {
	ArrowLeft,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowStatus } from "@/hooks/useWorkflowStack";
import { Badge } from "@/components/ui/badge";
import { WorkflowsTabContent } from "./WorkflowsTabContent";
import { Tooltipped } from "@/components/Common/Tooltiped";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useWorkflow } from "@/hooks/useWorkflow";
import WorkFlowProgressViewer from "@/components/WorkflowStack/WorkFlowProgressViewer";
import { Session } from "@supabase/supabase-js";
export const WorkflowViewer = ({ session }: { session: Session | null }): React.ReactNode => {
	const {
		setCurrentGraphId,
		setCurrentResult,
		currentGraph,
	} = useWorkflow();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="flex items-center gap-4 p-4 border-b">
				<Tooltipped
					tooltip="Back to Workflows"
				>
					<Button
						onClick={() => {
							setCurrentGraphId(null);
							setCurrentResult(null);
						}}
						size="icon"
						variant="ghost"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Tooltipped>
				<h2 className="text-xl font-semibold">{currentGraph?.name}</h2>
				<Badge variant="outline">
					{currentGraph?.event_type}
				</Badge>
				{currentGraph?.event_trigger &&
				currentGraph?.event_trigger.length > 0 && (
					<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
						<DialogTrigger asChild className="ml-auto">
							<Button variant="default">
								<Play className="h-4 w-4 mr-2" />
								Start {currentGraph?.name || "Workflow"}
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl ">
							<WorkFlowProgressViewer onClose={() => setIsDialogOpen(false)} />
						</DialogContent>
					</Dialog>
				)}
			</div>
			<WorkflowsTabContent />
		</div>
	);
};
