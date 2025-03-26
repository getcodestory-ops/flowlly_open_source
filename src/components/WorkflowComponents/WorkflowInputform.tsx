"use client";

import { useState, useRef } from "react";
import {
	MessageSquare,
	FileText,
	X,
	Edit3,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import { useStore } from "@/utils/store";
import { triggerEvent } from "@/api/taskQueue";
import { useWorkflowStack } from "@/hooks/useWorkflowStack";

interface WorkflowInputFormProps {
	eventId?: string;
	projectId: string;
	setPendingEvent: (_: boolean) => void;
	resultId: string;
	cacheId?: string;
}

const WorkflowInputForm: React.FC<WorkflowInputFormProps> = ({
	eventId,
	projectId,
	setPendingEvent,
	resultId,
	cacheId,
}: WorkflowInputFormProps) => {
	const [inputText, setInputText] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [drawings, setDrawings] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const session = useStore((state) => state.session);
	const { updateWorkflowByCacheId, addWorkflow } = useWorkflowStack((state) => ({
		updateWorkflowByCacheId: state.updateWorkflowByCacheId,
		addWorkflow: state.addWorkflow,
	}));

	// Generate stable IDs for file inputs using useRef
	const fileInputId = useRef(`file-upload-${eventId}-${Math.random().toString(36)
		.substring(7)}`).current;
	const drawingInputId = useRef(`drawing-upload-${eventId}-${Math.random().toString(36)
		.substring(7)}`).current;

	const handleSubmit = async(): Promise<void> => {
		if (!session || !projectId || !eventId) return;

		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("body", inputText);
			files.forEach((file) => formData.append("files", file));
			drawings.forEach((file) => formData.append("drawings", file));
			formData.append("streaming_key", resultId);

			const workflowResult = await triggerEvent({
				session,
				projectId,
				eventId: eventId,
				formData,
			});

			if (cacheId) {
				updateWorkflowByCacheId(cacheId, workflowResult);
			}
			else{
				addWorkflow({
					id: workflowResult.id,
					name: workflowResult.name,
					status: workflowResult.status,
					requiresInput: false,
					message: workflowResult.message,
					isPollingEnabled: true,
				}, session);
			}

			setInputText("");
			setFiles([]);
			setDrawings([]);
		} finally {
			setIsLoading(false);
			setPendingEvent(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 mb-4">
				<MessageSquare className="h-5 w-5 text-gray-600" />
				<h3 className="font-medium">
					What do you want to do? Attach files if needed.
				</h3>
			</div>
			{files.length > 0 && (
				<div className="border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted/30">
						<div className="flex flex-wrap gap-2">
							{files.map((file, index) => (
								<div
									className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border"
									key={index}
								>
									<FileText className="h-4 w-4 text-gray-500" />
									<span className="truncate max-w-[200px]">{file.name}</span>
									<button
										className="hover:text-destructive"
										onClick={() =>
											setFiles(files.filter((_, i) => i !== index))
										}
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{drawings.length > 0 && (
				<div className="border rounded-lg overflow-hidden">
					<div className="p-4 bg-muted/30">
						<div className="flex flex-wrap gap-2">
							{drawings.map((file, index) => (
								<div
									className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border"
									key={index}
								>
									<Edit3 className="h-4 w-4 text-gray-500" />
									<span className="truncate max-w-[200px]">{file.name}</span>
									<button
										className="hover:text-destructive"
										onClick={() =>
											setDrawings(drawings.filter((_, i) => i !== index))
										}
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			<Textarea
				className="min-h-[100px] resize-none"
				key={cacheId ?? "no-cache-id"}
				onChange={(e) => setInputText(e.target.value)}
				placeholder="Type your instructions here..."
				value={inputText}
			/>
			<div className="flex gap-2 items-center">
				<Input
					className="hidden"
					id={fileInputId}
					multiple
					onChange={(e) =>
						e.target.files &&
            setFiles([...files, ...Array.from(e.target.files)])
					}
					type="file"
				/>
				<Button
					className="h-9"
					onClick={() =>
						document.getElementById(fileInputId)?.click()
					}
					size="sm"
					variant="outline"
				>
					<FileText className="h-4 w-4 mr-2" />
					Attach Files
				</Button>
				<Input
					className="hidden"
					id={drawingInputId}
					multiple
					onChange={(e) =>
						e.target.files &&
            setDrawings([...drawings, ...Array.from(e.target.files)])
					}
					type="file"
				/>
				<Button
					className="h-9"
					onClick={() =>
						document.getElementById(drawingInputId)?.click()
					}
					size="sm"
					variant="outline"
				>
					<Edit3 className="h-4 w-4 mr-2" />
					Attach Drawings
				</Button>
				<Button
					className="ml-auto"
					disabled={isLoading}
					onClick={handleSubmit}
				>
					{isLoading ? (
						<>
							Submitting...
						</>
					) : (
						"Submit Response"
					)}
				</Button>
			</div>
		</div>
	);
};

export default WorkflowInputForm;
