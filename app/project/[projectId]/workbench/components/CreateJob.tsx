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

function CreateJob() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocumentWriterDialogOpen, setIsDocumentWriterDialogOpen] =
    useState(false);
  const [isDailyJournalDialogOpen, setIsDailyJournalDialogOpen] =
    useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string>("meeting");
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
          <DropdownMenuItem>Search folders</DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("meeting");
              setIsDialogOpen(true);
            }}
          >
            Create New Meeting
          </DropdownMenuItem>
          <DropdownMenuItem>Update Schedule</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setSelectedJobType("dailyJournal");
              setIsDailyJournalDialogOpen(true);
            }}
          >
            New Daily Journal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={selectedJobType === "meeting" && isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="w-full">
          <ProjectEventCreationForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={
          selectedJobType === "documentWriter" && isDocumentWriterDialogOpen
        }
        onOpenChange={setIsDocumentWriterDialogOpen}
      >
        <DialogContent className="max-w-5xl mx-auto">
          <DocumentWriterForm />
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
    </div>
  );
}

export default CreateJob;
