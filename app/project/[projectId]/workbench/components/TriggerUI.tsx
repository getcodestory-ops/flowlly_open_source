import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerEvent } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import type { EventResult } from "./types";

interface TriggerUIProps {
  eventId: string;
  onTrigger: (result: EventResult) => void;
  setTab: (tab: string) => void;
}

export const TriggerUI = ({ eventId, onTrigger, setTab }: TriggerUIProps) => {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const setRefreshInterval = useStore((state) => state.setRefreshInterval);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!session || !activeProject) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", inputText);
      files.forEach((file) => formData.append("files", file));

      const result = await triggerEvent({
        session,
        projectId: activeProject.project_id,
        eventId,
        formData,
      });

      onTrigger(result);
    } finally {
      setIsLoading(false);
      setRefreshInterval(5000);
      setTab("schedules");
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="space-y-4">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
              >
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Label
            htmlFor="file-upload"
            className="cursor-pointer hover:bg-muted px-3 py-2 rounded-md text-sm"
          >
            <span className="flex items-center gap-2">📎 Attach</span>
          </Label>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? "Starting..." : "Start Workflow"}
          </Button>
        </div>
      </div>
    </div>
  );
};
