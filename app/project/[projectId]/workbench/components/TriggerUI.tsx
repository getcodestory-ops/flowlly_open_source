import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { triggerEvent } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import type { EventResult } from "./types";

interface TriggerUIProps {
  eventId: string;
  onTrigger: (result: EventResult) => void;
}

export const TriggerUI = ({ eventId, onTrigger }: TriggerUIProps) => {
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const setRefreshInterval = useStore((state) => state.setRefreshInterval);

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
    }
  };

  return (
    <div className=" rounded-lg p-4 bg-background">
      <div className="space-y-4">
        <Button onClick={handleSubmit} disabled={isLoading} className="">
          {isLoading ? "Starting..." : "Start New Workflow"}
        </Button>
      </div>
    </div>
  );
};
