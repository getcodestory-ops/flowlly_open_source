import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProjectEventCreationForm from "@/components/ProjectEvent/ProjectEventCreationForm";
import DocumentWriterForm from "@/components/ProjectEvent/DocumentWriterForm";
import DailyJournalForm from "@/components/ProjectEvent/DailyJournalForm";
import CustomWorkflowForm from "@/components/ProjectEvent/CustomWorkFlow/CustomWorkflowForm";

function CreateJob() {
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
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Job
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("documentWriter");
              setIsDocumentWriterDialogOpen(true);
            }}
          >
            New Document Writer
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
          {/* <DropdownMenuItem>Update Schedule</DropdownMenuItem> */}
          {/* <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("dailyJournal");
              setIsDailyJournalDialogOpen(true);
            }}
          >
            New Daily Journal
          </DropdownMenuItem> */}
          <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("customWorkflow");
              setIsCustomWorkflowDialogOpen(true);
            }}
          >
            Custom Workflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={selectedJobType === "meeting" && isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="w-full">
          <ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={
          selectedJobType === "documentWriter" && isDocumentWriterDialogOpen
        }
        onOpenChange={setIsDocumentWriterDialogOpen}
      >
        <DialogContent className="max-w-5xl mx-auto">
          <DocumentWriterForm
            onClose={() => setIsDocumentWriterDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedJobType === "dailyJournal" && isDailyJournalDialogOpen}
        onOpenChange={setIsDailyJournalDialogOpen}
      >
        <DialogContent className="w-4xl mx-auto">
          <DailyJournalForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={
          selectedJobType === "customWorkflow" && isCustomWorkflowDialogOpen
        }
        onOpenChange={setIsCustomWorkflowDialogOpen}
      >
        <DialogContent className="max-w-[90vw]  p-4 ">
          <CustomWorkflowForm
            onClose={() => setIsCustomWorkflowDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateJob;
