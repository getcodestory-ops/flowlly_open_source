import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { triggerEvent } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import type { EventResult } from "./types";
import { useQueryClient } from "@tanstack/react-query";
interface TriggerUIProps {
  eventId: string;
  onTrigger: (result: EventResult) => void;
}

export const TriggerUI = ({ eventId, onTrigger }: TriggerUIProps) => {
	const [inputText, setInputText] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const session = useStore((state) => state.session);
	const activeProject = useStore((state) => state.activeProject);
	const setRefreshInterval = useStore((state) => state.setRefreshInterval);
	const queryClient = useQueryClient();
	const handleSubmit = async() => {
		if (!session || !activeProject) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("body", inputText);
			files.forEach((file) => formData.append("files", file));

			const result = await triggerEvent({
				session,
				projectId: activeProject.project_id,
				eventId,
				formData,
			});

			onTrigger(result);
		} finally {
			setRefreshInterval(5000);
			setTimeout(() => {
				setIsLoading(false);
			}, 8000);
		}
	};

	return (
		<div className="rounded-lg p-4 bg-background">
			<div className="space-y-4">
				<Button
					className=""
					disabled={isLoading}
					onClick={handleSubmit}
				>
					{isLoading ? "Starting..." : "Start New Workflow"}
				</Button>
				{isLoading && (
					<div className="flex flex-col items-center mt-4 space-y-2">
						<div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[progressLine_10s_linear_infinite]" />
					</div>
				)}
			</div>
		</div>
	);
};
