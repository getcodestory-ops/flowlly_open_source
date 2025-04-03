import { Workflow } from "@/hooks/useWorkflowStack";
import { useWorkflow } from "@/hooks/useWorkflow";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { TriggerUI } from "@/components/WorkflowComponents/TriggerUI";
import { EventResult } from "../WorkflowComponents/types";

const WorkFlowProgressViewer = ({ 
	workflow, 
	onClose, 
}: { 
	workflow?: Workflow, 
	onClose?: () => void 
}): React.ReactNode => {
	const {
		currentGraphId,
		setCurrentResult,
		currentGraph,
	} = useWorkflow();

	const setWorkflow = (result: EventResult): void => {
		setCurrentResult(result);
		onClose?.();
	};

	return <div>
		<div className="flex flex-col gap-4">
			{!workflow && currentGraph?.event_trigger &&
			currentGraph?.event_trigger.length > 0 &&
			currentGraph?.event_trigger[0].trigger_by === "ui" && (
				<Card className="border-0 shadow-none overflow-hidden">
					<CardHeader>
						<CardTitle>Trigger Workflow</CardTitle>
						<CardDescription>
							Start a new workflow run
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TriggerUI
							eventId={currentGraphId || ""}
							name={currentGraph?.name}
							onTrigger={setWorkflow}
						/>
					</CardContent>
					<CardFooter className="flex justify-center items-center text-xs text-muted-foreground">
						<span>Step 1</span>
					</CardFooter>
				</Card>
			)}
		</div>

	</div>;
};

export default WorkFlowProgressViewer;


