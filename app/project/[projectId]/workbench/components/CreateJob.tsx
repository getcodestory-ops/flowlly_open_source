import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
          <Button className="bg-indigo-500 text-white">
            <Plus className="mr-2 h-4 w-4" /> Create a worker
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
            Deploy a new worker
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet
        open={selectedJobType === "meeting" && isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <SheetContent side="right" className="w-[50vw]">
          <ProjectEventCreationForm onClose={() => setIsDialogOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet
        open={
          selectedJobType === "documentWriter" && isDocumentWriterDialogOpen
        }
        onOpenChange={setIsDocumentWriterDialogOpen}
      >
        <SheetContent side="right" className="w-[50vw]">
          <DocumentWriterForm
            onClose={() => setIsDocumentWriterDialogOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={selectedJobType === "dailyJournal" && isDailyJournalDialogOpen}
        onOpenChange={setIsDailyJournalDialogOpen}
      >
        <SheetContent side="right" className="w-[50vw]">
          <DailyJournalForm />
        </SheetContent>
      </Sheet>

      <Sheet
        open={
          selectedJobType === "customWorkflow" && isCustomWorkflowDialogOpen
        }
        onOpenChange={setIsCustomWorkflowDialogOpen}
      >
        <SheetContent side="right" className="w-[90vw]">
          <CustomWorkflowForm
            onClose={() => setIsCustomWorkflowDialogOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateJob;
