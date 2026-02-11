"use client";

import React from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewStore } from "@/utils/store";

export default function LayoutModeToggle(): React.ReactElement {
	const { chatLayoutMode, setChatLayoutMode } = useViewStore();
	const isAgentMode = chatLayoutMode === "agent";

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className={`gap-1.5 text-xs transition-all duration-200 border border-slate-200 ${
							isAgentMode
								? "text-purple-600 hover:bg-purple-50"
								: "text-slate-500 hover:bg-slate-50"
						}`}
						onClick={() => setChatLayoutMode(isAgentMode ? "split" : "agent")}
						size="sm"
						variant="ghost"
					>
						{isAgentMode ? (
							<>
								<PanelLeft className="h-3.5 w-3.5" />
								<span>Split</span>
							</>
						) : (
							<>
								<PanelLeftClose className="h-3.5 w-3.5" />
								<span>Focus</span>
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" sideOffset={5}>
					<p className="text-xs">{isAgentMode ? "Switch to split view" : "Switch to focus mode"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
