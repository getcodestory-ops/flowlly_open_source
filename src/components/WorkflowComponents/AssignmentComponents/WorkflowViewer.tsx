"use client";
import React, { useState } from "react";
import {
	ArrowLeft,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowsTabContent } from "./WorkflowsTabContent";
import { Tooltipped } from "@/components/Common/Tooltiped";
import { useWorkflow } from "@/hooks/useWorkflow";
import { Session } from "@supabase/supabase-js";
export const WorkflowViewer = ({ session }: { session: Session | null }): React.ReactNode => {
	const {
		setCurrentGraphId,
		setCurrentResult,
		currentGraph,
	} = useWorkflow();

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
			</div>
			<WorkflowsTabContent />
		</div>
	);
};
