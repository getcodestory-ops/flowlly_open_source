import React, { useEffect, useState } from "react";
import {
  Flex,
  Tooltip,
  Button,
  Icon,
  Grid,
  GridItem,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Textarea,
  ModalFooter,
  useToast,
  Box,
} from "@chakra-ui/react";
import {
  getScheduleSummary,
  updateScheduleViaNotes,
} from "@/api/schedule_routes";
import { getNotifications } from "@/api/update_routes";
import { FaPencilAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useStore } from "@/utils/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import ScheduleNotifications from "../Notifications/ScheduleNotifications";
import MediaRecorderButton from "../ChatInput/MediaRecorderButton";

function ScheduleSummaryView() {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const [activeEdit, setActiveEdit] = useState(true);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["scheduleSummaryDaily", activeProject, session],
    queryFn: () => {
      if (!session || !activeProject)
        return Promise.reject("no session or project");
      return getScheduleSummary(session, activeProject.project_id);
    },
    enabled: !!session,
  });

  const { data: notifications } = useQuery({
    queryKey: ["projectNotification", activeProject, session],
    queryFn: () => {
      if (!session || !activeProject)
        return Promise.reject("no session or project");
      return getNotifications(session, activeProject.project_id);
    },
    enabled: !!session,
  });

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
      return updateScheduleViaNotes(session, activeProject.project_id, content);
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

  useEffect(() => {
    console.log("notifications", notifications);
  }, [notifications]);

  return (
    <Grid templateColumns="repeat(8, 1fr)" gap="4" p="4">
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="4xl">
        <ModalOverlay />
        {data?.data && (
          <ModalContent>
            <ModalHeader>Edit Schedule</ModalHeader>
            <ModalBody>
              {activeEdit && (
                <>
                  <Text fontWeight={"bold"} p="2">
                    Add your notes and revisions here
                  </Text>

                  <Textarea
                    resize="vertical"
                    rows={10}
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                  ></Textarea>
                </>
              )}
              {!activeEdit && content}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="yellow"
                onClick={() => {
                  if (!activeEdit) setActiveEdit((state) => !state);
                  if (!isPending && activeEdit) mutate();
                }}
                isActive={isPending}
              >
                {isPending
                  ? "Note submitted Successfully!"
                  : "Submit your note to AI scheduler"}
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
      <GridItem colSpan={6}>
        <Flex direction="column">
          <Text fontWeight={"bold"}>Today&#39;s Schedule</Text>

          <Flex justifyContent={"right"}></Flex>
          {isLoading && (
            <Flex gap="2">
              <Text>Generating the summary...</Text>{" "}
              <Flex
                justifyContent={"center"}
                alignItems={"center"}
                animation={`spin infinite 2s linear`}
                css={{
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <AiOutlineLoading3Quarters />
              </Flex>
            </Flex>
          )}

          {data?.data && (
            <Flex p="4">
              <MarkDownDisplay content={data?.data} />
            </Flex>
          )}
        </Flex>
        <MediaRecorderButton />
        <Tooltip label="Edit schedule using notes">
          <Button size="xs" onClick={() => setIsOpen(true)}>
            {isPending
              ? "Note submitted Successfully!"
              : "Submit your note or progress"}
            <Icon as={FaPencilAlt} ml="2" />
          </Button>
        </Tooltip>
      </GridItem>
      <GridItem colSpan={2}>
        <ScheduleNotifications />
      </GridItem>
    </Grid>
  );
}

export default ScheduleSummaryView;
