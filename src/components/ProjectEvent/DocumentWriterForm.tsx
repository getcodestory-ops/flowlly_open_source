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
import { MultiSelect } from "@/components/ui/multi-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/utils/store";
// import { CreateDocumentWriter } from "@/types/documentWriter";
// import { createNewDocumentWriter } from "@/api/taskQueue";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  fetchFolders,
  fetchFiles,
  GetFolderFileProp,
  GetFolderSubFolderProp,
} from "@/api/folderRoutes";
import { Folder, File, X } from "lucide-react";
import DocumentSelector from "./DocumentSelector";

export default function DocumentWriterForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [writePrompt, setWritePrompt] = useState("");
  const [recurrence, setRecurrence] = useState<string>("once");
  const [isFormValid, setIsFormValid] = useState(false);
  const [startTime, setStartTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isProjectWide, setIsProjectWide] = useState(true);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: string; name: string; type: "folder" | "file" }>
  >([]);

  // Mock folders (replace with actual data fetching in a real application)
  const folders = [
    { id: "1", name: "Project Documents" },
    { id: "2", name: "Meeting Notes" },
    { id: "3", name: "Research Papers" },
  ];

  const { mutate } = useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Document writer created successfully!",
        duration: 9000,
      });
      queryClient.invalidateQueries({ queryKey: ["documentWriters"] });
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
      searchQuery !== "" &&
      writePrompt !== "" &&
      startTime !== "";
    setIsFormValid(isValid);
  }, [name, searchQuery, writePrompt, startTime]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !activeProject) {
      console.error("Session or active project not available");
      return;
    }
    // const submissionData: CreateDocumentWriter = {
    //   name,
    //   folders: selectedFolders,
    //   search_query: searchQuery,
    //   write_prompt: writePrompt,
    //   recurrence,
    // };
    console.log("Form submitted:");
  };

  //     mutate({
  //       session,
  //       projectId: activeProject.project_id,
  //       documentWriter: submissionData,
  //     });
  //   };

  const { data: foldersData, isLoading: isFoldersLoading } = useQuery({
    queryKey: [
      "folders",
      session?.access_token,
      activeProject?.project_id,
      currentFolderId,
      isProjectWide,
    ],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return fetchFolders(
        session,
        activeProject?.project_id,
        currentFolderId,
        isProjectWide
      );
    },
    enabled: !!session && !!activeProject,
  });

  const { data: filesData, isLoading: isFilesLoading } = useQuery({
    queryKey: [
      "files",
      session?.access_token,
      activeProject?.project_id,
      currentFolderId,
      isProjectWide,
    ],
    queryFn: () => {
      if (!session || !activeProject?.project_id)
        return Promise.reject("Session or active project not available");
      return fetchFiles(
        session,
        activeProject?.project_id,
        currentFolderId,
        isProjectWide
      );
    },
    enabled: !!session && !!activeProject,
  });

  const toggleItemSelection = (item: {
    id: string;
    name: string;
    type: "folder" | "file";
  }) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const removeSelectedItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ScrollArea className="w-full  h-full">
      <div className="flex">
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>Create Document Writer</CardTitle>
            <span className="text-sm mt-2 font-thin">
              {new Date().toLocaleTimeString()} {timeZone}
            </span>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex">
              <CardContent className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchQuery">What to search</Label>
                  <Input
                    id="searchQuery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="writePrompt">Write prompt</Label>
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
              </CardContent>
            </div>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!isFormValid}>
                Create Document Writer
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="w-96 p-2 border-l">
          <DocumentSelector
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>
      </div>
    </ScrollArea>
  );
}
