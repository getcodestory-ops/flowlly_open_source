import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Calendar, Video } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import DocumentWriterForm from "@/components/ProjectEvent/DocumentWriterForm";
import DailyJournalForm from "@/components/ProjectEvent/DailyJournalForm";
import CustomWorkflowForm from "@/components/ProjectEvent/CustomWorkFlow/CustomWorkflowForm";
import { useRouter } from "next/navigation";

type WorkflowSheet = {
	type: string;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	width?: string;
	component: React.ReactNode;
	selectedJobType: string;
};

const WorkflowSheetWrapper: React.FC<WorkflowSheet> = ({
	type,
	isOpen,
	setIsOpen,
	width = "50vw",
	component,
	selectedJobType,
}) => (
	<Sheet
		onOpenChange={setIsOpen}
		open={selectedJobType === type && isOpen}
	>
		<SheetContent className={`w-[${width}]`} side="right">
			{component}
		</SheetContent>
	</Sheet>
);

function CreateJob(): React.ReactNode {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDocumentWriterDialogOpen, setIsDocumentWriterDialogOpen] =
		useState(false);
	const [isDailyJournalDialogOpen, setIsDailyJournalDialogOpen] =
		useState(false);
	const [selectedJobType, setSelectedJobType] = useState<string>("meeting");
	const [isCustomWorkflowDialogOpen, setIsCustomWorkflowDialogOpen] =
		useState(false);

	const workflowSheets: WorkflowSheet[] = [
		{
			type: "meeting",
			isOpen: isDialogOpen,
			setIsOpen: setIsDialogOpen,
			component: <ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />,
			selectedJobType: selectedJobType,
		},
		{
			type: "documentWriter",
			isOpen: isDocumentWriterDialogOpen,
			setIsOpen: setIsDocumentWriterDialogOpen,
			component: <DocumentWriterForm onClose={() => setIsDocumentWriterDialogOpen(false)} />,
			selectedJobType: selectedJobType,
		},
		{
			type: "dailyJournal",
			isOpen: isDailyJournalDialogOpen,
			setIsOpen: setIsDailyJournalDialogOpen,
			component: <DailyJournalForm />,
			selectedJobType: selectedJobType,
		},
		{
			type: "customWorkflow",
			isOpen: isCustomWorkflowDialogOpen,
			setIsOpen: setIsCustomWorkflowDialogOpen,
			width: "90vw",
			component: <CustomWorkflowForm onClose={() => setIsCustomWorkflowDialogOpen(false)} />,
			selectedJobType: selectedJobType,
		},
	];

	return (
		<div className="flex justify-between items-center">
			      <div className="relative">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="bg-indigo-500 text-white">
							<Plus className="mr-2 h-4 w-4" /> Create Workflow
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							onSelect={() => {
								setSelectedJobType("customWorkflow");
								setIsCustomWorkflowDialogOpen(true);
							}}
						>
							<Settings className="mr-2 h-4 w-4" />
							Build a workflow
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => {
								setSelectedJobType("meeting");
								setIsDialogOpen(true);
							}}
						>
							<Video className="mr-2 h-4 w-4" />
							Create New Meeting
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => {
								router.push(
									`/project/${
										window.location.pathname.split("/")[2]
									}/integrations`,
								);
							}}
						>
							<Calendar className="mr-2 h-4 w-4" />
							Connect to Calendar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{workflowSheets.map((sheet) => (
					<WorkflowSheetWrapper key={sheet.type} {...sheet} />
				))}
			</div>
		</div>
	);
}

export default CreateJob;
