import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ContentEditor from "@/components/DocumentEditor/ContentEditor";
import { Textarea } from "@/components/ui/textarea";
import {
	NodeStatus,
	NodeType,
	ReportNodeConfig,
	WorkflowNode,
} from "../../types";


interface ReportNodeProps {
  onSave: (node: WorkflowNode) => void;
  onCancel: () => void;
  editingNode?: WorkflowNode;
}

export function ReportNode({ onSave, onCancel, editingNode }: ReportNodeProps): React.ReactNode {
	const [config, setConfig] = useState<ReportNodeConfig>({
		report_prompt: "",
		next_steps: [],
		retry_count: 0,
		max_retries: 0,
		folder_id: "",
	});


	const [reportPrompt, setReportPrompt] = useState(
		(editingNode?.config as ReportNodeConfig)?.report_prompt || "",
	);
	const [reportPromptMarkdown, setReportPromptMarkdown] = useState(
		(editingNode?.config as ReportNodeConfig)?.report_prompt || "",
	);

	useEffect(() => {
		if (editingNode?.type === NodeType.REPORT_GENERATION) {
			const reportConfig = editingNode.config as ReportNodeConfig;
			setConfig(reportConfig);
		}
	}, [editingNode]);



	return (
		<Card>
			<CardContent className="space-y-4 pt-6">
				
				<Label htmlFor="reportPrompt">Report Template</Label>
				<div className="h-[500px] overflow-y-auto">
					<ContentEditor
						content={reportPrompt}
						setContent={(value) => setReportPromptMarkdown(value)}
					/>
				</div>				
				<div className="flex justify-end space-x-2">
					<Button
						onClick={onCancel}
						type="button"
						variant="outline"
					>
            Cancel
					</Button>
					<Button
						disabled={!reportPromptMarkdown}
						onClick={() => {
							onSave({
								id: editingNode?.id || crypto.randomUUID(),
								type: NodeType.REPORT_GENERATION,
								config: {
									...config,
									report_prompt: reportPromptMarkdown,
								},
								title: "Report Generation",
								status: NodeStatus.PENDING,
								timestamp: new Date().toISOString(),
								retry_count: 0,
							});
						}}
						type="button"
					>
						{editingNode ? "Update" : "Add"} Node
					</Button>
				</div>
			</CardContent>

		</Card>
	);
}
