import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

function CreateJob() {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDocumentWriterDialogOpen, setIsDocumentWriterDialogOpen] =
    useState(false);
	const [isDailyJournalDialogOpen, setIsDailyJournalDialogOpen] =
    useState(false);
	const [selectedJobType, setSelectedJobType] = useState<string>("meeting");
	const [isCustomWorkflowDialogOpen, setIsCustomWorkflowDialogOpen] =
    useState(false);

	return (
		<div className="flex justify-between items-center mb-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="bg-indigo-500 text-white">
						<Plus className="mr-2 h-4 w-4" /> Create new workflow
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						onSelect={() => {
							setSelectedJobType("customWorkflow");
							setIsCustomWorkflowDialogOpen(true);
						}}
					>
            Build a workflow
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							setSelectedJobType("documentWriter");
							setIsDocumentWriterDialogOpen(true);
						}}
					>
            Document Writer
					</DropdownMenuItem>
					{/* <DropdownMenuItem>Search folders</DropdownMenuItem> */}

					<DropdownMenuItem
						onSelect={() => {
							setSelectedJobType("meeting");
							setIsDialogOpen(true);
						}}
					>
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
            Connect to Calendar
					</DropdownMenuItem>
					{/* <DropdownMenuItem>Update Schedule</DropdownMenuItem> */}
					{/* <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("dailyJournal");
              setIsDailyJournalDialogOpen(true);
            }}
          >
            New Daily Journal
          </DropdownMenuItem> */}
				</DropdownMenuContent>
			</DropdownMenu>
			<Sheet
				onOpenChange={setIsDialogOpen}
				open={selectedJobType === "meeting" && isDialogOpen}
			>
				<SheetContent className="w-[50vw]" side="right">
					<ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />
				</SheetContent>
			</Sheet>
			<Sheet
				onOpenChange={setIsDocumentWriterDialogOpen}
				open={
					selectedJobType === "documentWriter" && isDocumentWriterDialogOpen
				}
			>
				<SheetContent className="w-[50vw]" side="right">
					<DocumentWriterForm
						onClose={() => setIsDocumentWriterDialogOpen(false)}
					/>
				</SheetContent>
			</Sheet>
			<Sheet
				onOpenChange={setIsDailyJournalDialogOpen}
				open={selectedJobType === "dailyJournal" && isDailyJournalDialogOpen}
			>
				<SheetContent className="w-[50vw]" side="right">
					<DailyJournalForm />
				</SheetContent>
			</Sheet>
			<Sheet
				onOpenChange={setIsCustomWorkflowDialogOpen}
				open={
					selectedJobType === "customWorkflow" && isCustomWorkflowDialogOpen
				}
			>
				<SheetContent className="w-[90vw]" side="right">
					<CustomWorkflowForm
						onClose={() => setIsCustomWorkflowDialogOpen(false)}
					/>
				</SheetContent>
			</Sheet>
		</div>
	);
}

export default CreateJob;
