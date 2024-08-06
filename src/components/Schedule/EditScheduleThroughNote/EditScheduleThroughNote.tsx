import React, { use, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { MdSend } from "react-icons/md";

import { updateScheduleViaNotes } from "@/api/schedule_routes";
import { useStore } from "@/utils/store";
import { useMutation } from "@tanstack/react-query";

function EditScheduleThroughNotes({ activityName }: { activityName: string }) {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [activeEdit, setActiveEdit] = useState(true);
  const [content, setContent] = useState("");

  const toast = useToast();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => {
      if (!session || !activeProject)
        return Promise.reject("no session or project");
      if (!content) {
        toast({
          position: "bottom-right",
          title: "Warning",
          description: "Please add your notes to update the schedule",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
        return Promise.reject("no content");
      }
      setActiveEdit((state) => !state);
      toast({
        position: "bottom-right",
        title: "Warning",
        description: "Note submitted to AI scheduler for analysis!",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return updateScheduleViaNotes(
        session,
        activeProject.project_id,
        `Note for '${activityName}': `
      );
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toast({
        position: "bottom-right",
        title: "Success",
        description:
          "Schedule Analysis is generated successfully, check action items for more details!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [isSuccess]);

  return (
    <div className="flex flex-col gap-4">
      {activeEdit && (
        <div className="p-2">
          <Textarea
            placeholder={"Add updates or notes related to the activity here"}
            rows={10}
            className="p-2"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          ></Textarea>
        </div>
      )}

      {!activeEdit && content}
      <div>
        <Button
          aria-label="Submit Note to AI scheduler"
          variant="outline"
          onClick={() => {
            if (!activeEdit) setActiveEdit((state) => !state);
            if (!isPending && activeEdit) mutate();
          }}
          disabled={isPending}
          size="sm"
        >
          <MdSend className="mr-2" />
          {isPending
            ? "Note submitted Successfully!"
            : "Submit your note to AI scheduler"}
        </Button>
      </div>
    </div>
  );
}

export default EditScheduleThroughNotes;
