import React from "react";
import { ResultViewer } from "../ResultViewer";
import MeetingSettings from "../Meeting/MeetingSettings";
import LoaderAnimation from "@/components/Animations/LoaderAnimation";
import { useWorkflow } from "@/hooks/useWorkflow";

export const WorkflowsTabContent = (): React.ReactNode => {
	return (
		<div className="flex flex-1 flex-grow h-screen overflow-hidden">
			<div className="flex-grow flex-1 flex flex-col min-h-0" style={{ maxHeight: "100vh" }}>
				<div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
					<WorkflowContent />
				</div>
			</div>
		</div>
	);
};



const WorkflowContent = (): React.ReactNode => {
	const { currentResult, isLoadingResult } = useWorkflow();



	return (
		<>
			{currentResult ? (
				isLoadingResult ? (
					<div className="flex flex-grow flex-1 h-full items-center justify-center">
						<LoaderAnimation />
					</div>
				) : (
					<ResultViewer
						currentResult={currentResult}
						key={currentResult.id}											
						backToMeetings={true}
					/>
				)
			) : (
				<MeetingSettings />
			)}
		</>
	);
};
