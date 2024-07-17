import React, { use, useEffect, useState } from "react";
import {
  Button,
  Flex,
  Grid,
  IconButton,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
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
    <Flex flexDir={"column"} gap="4">
      {activeEdit && (
        <>
          <Text fontWeight={"bold"} p="2">
            Add updates or notes related to the activity here
          </Text>

          <Textarea
            resize="vertical"
            rows={10}
            fontSize={"sm"}
            onChange={(e) => setContent(e.target.value)}
            value={content}
            bg="white"
          ></Textarea>
        </>
      )}

      {!activeEdit && content}
      <Flex>
        <Button
          leftIcon={<MdSend />}
          border="1px"
          aria-label="Submit Note to AI scheduler"
          colorScheme="yellow"
          onClick={() => {
            if (!activeEdit) setActiveEdit((state) => !state);
            if (!isPending && activeEdit) mutate();
          }}
          isActive={isPending}
          size="xs"
        >
          {isPending
            ? "Note submitted Successfully!"
            : "Submit your note to AI scheduler"}
        </Button>
      </Flex>
    </Flex>
  );
}

export default EditScheduleThroughNotes;
