"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "../ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Folder, File, X } from "lucide-react";
import DocumentSelector from "./DocumentSelector";
import { CreateEvent } from "@/types/projectEvents";
import { createNewProjectEvent } from "@/api/taskQueue";
import { GraphData } from "../../../app/project/[projectId]/workbench/components/types";
import FolderBrowserModal from "./FolderBrowserModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DocumentWriterForm({
  onClose,
  editData,
}: {
  onClose: () => void;
  editData?: GraphData;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [name, setName] = useState("");
  const [writePrompt, setWritePrompt] = useState("");
  const [recurrence, setRecurrence] = useState<string>("once");
  const [isFormValid, setIsFormValid] = useState(false);
  const [startTime, setStartTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; name: string; type: "folder" | "file" }>
  >([]);

  const [outputFolderId, setOutputFolderId] = useState<string | null>(null);
  const [isFolderBrowserOpen, setIsFolderBrowserOpen] = useState(false);
  const [selectedOutputFolder, setSelectedOutputFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);

  // Mock folders (replace with actual data fetching in a real application)

  const { mutate, isPending } = useMutation({
    mutationFn: (createEvent: CreateEvent) => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return createNewProjectEvent({
        session,
        projectId: activeProject?.project_id,
        projectEvent: createEvent,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Document writer created successfully!",
        duration: 9000,
      });
      queryClient.invalidateQueries({
        queryKey: ["projectEvents"],
      });

      // Reset form state
      setName("");
      setWritePrompt("");
      setRecurrence("once");
      setStartTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setSelectedItems([]);
      setOutputFolderId(null);

      // Close the form
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        duration: 9000,
      });
    },
  });

  useEffect(() => {
    const isValid =
      name !== "" &&
      writePrompt !== "" &&
      startTime !== "" &&
      selectedItems.length > 0 &&
      outputFolderId !== null;
    setIsFormValid(isValid);
  }, [name, writePrompt, startTime, selectedItems, outputFolderId]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !activeProject) {
      console.error("Session or active project not available");
      return;
    }

    const createEvent: CreateEvent = {
      project_event: {
        name,
        event_type: "document_writing",
        metadata: {
          write_prompt: writePrompt,
          recurrence_day: format(startTime, "EEEE"),
          time: format(startTime, "HH:mm"),
          frequency: recurrence,
          triggerType: "ui",
          selected_items: selectedItems,
          output_folder_id: outputFolderId,
        },
      },
      event_participants: [
        {
          role: "owner",
          identification: "user_id",
          metadata: {},
        },
      ],
      start_time: format(startTime, "HH:mm"),
      start_date: format(new Date(), "yyyy-MM-dd"),
      recurrence: recurrence,
      time_zone: timeZone,
      join_now: true,
    };

    mutate(createEvent);
  };

  const removeSelectedItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOutputFolderSelect = (folderId: string, folderName: string) => {
    setSelectedOutputFolder({ id: folderId, name: folderName });
    setOutputFolderId(folderId);
  };

  return (
    <ScrollArea className="w-full h-full">
      <div className="flex">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Create Document Writer</CardTitle>
            <span className="text-sm mt-2 font-thin">
              {new Date().toLocaleTimeString()} {timeZone}
            </span>
          </CardHeader>
          <div className="flex">
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="writePrompt">
                  Write description of the report you want to create
                </Label>
                <Textarea
                  id="writePrompt"
                  value={writePrompt}
                  onChange={(e) => setWritePrompt(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">Repeat</Label>
                <Select
                  name="recurrence"
                  value={recurrence}
                  onValueChange={setRecurrence}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select repeat frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="inputFiles">
                    Select input files and folders
                  </Label>
                </div>

                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsDocumentSelectorOpen(true)}
                    className="flex-1"
                  >
                    {selectedItems.length > 0
                      ? `${selectedItems.length} item${
                          selectedItems.length > 1 ? "s" : ""
                        } selected`
                      : "Select files and folders"}
                  </Button>
                </div>

                {selectedItems.length > 0 && (
                  <Card className="border p-3">
                    <ScrollArea className="h-[100px]">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2"
                        >
                          <div className="flex items-center text-sm flex-1">
                            {item.type === "folder" ? (
                              <Folder
                                className="mr-2 text-blue-500 flex-shrink-0"
                                size={12}
                              />
                            ) : (
                              <File
                                className="mr-2 text-green-500 flex-shrink-0"
                                size={12}
                              />
                            )}
                            <span className="truncate" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedItem(item.id)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="saveToFolder">
                    Save generated files in a specific folder
                  </Label>
                </div>

                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsFolderBrowserOpen(true)}
                    className="flex-1"
                  >
                    {selectedOutputFolder
                      ? selectedOutputFolder.name
                      : "Select output folder"}
                  </Button>
                  {selectedOutputFolder && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOutputFolder(null);
                        setOutputFolderId(null);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
          <CardFooter>
            <Button
              type="button"
              className="w-full"
              disabled={!isFormValid || isPending}
              onClick={handleSubmit}
            >
              {isPending ? (
                <span className="spinner">Loading...</span>
              ) : (
                "Create Document Writer"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Dialog
        open={isDocumentSelectorOpen}
        onOpenChange={setIsDocumentSelectorOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Files and Folders</DialogTitle>
          </DialogHeader>
          <DocumentSelector
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
          <DialogFooter>
            <Button onClick={() => setIsDocumentSelectorOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FolderBrowserModal
        isOpen={isFolderBrowserOpen}
        onClose={() => setIsFolderBrowserOpen(false)}
        onSelect={handleOutputFolderSelect}
      />
    </ScrollArea>
  );
}
