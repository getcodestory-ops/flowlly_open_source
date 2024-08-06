import React, { use, useEffect, useState } from "react";
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
  useMediaQuery,
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
import ScheduleNotifications from "../Notifications/ScheduleNotifications";
import MediaRecorderButton from "../ChatInput/MediaRecorderButton";
import DashboardXMLViewer from "../ProjectDashboard/DashboardViewer";
import { ActionDock } from "@/components/ProjectDashboard/ActionDock";

function ScheduleSummaryView() {
  const session = useStore((state) => state.session);
  const [smallScreen] = useMediaQuery("(max-width: 1441px)");
  const activeProject = useStore((state) => state.activeProject);

  const [activeEdit, setActiveEdit] = useState(true);
  const [content, setContent] = useState("");
  const [summaryContent, setSummaryContent] = useState("");
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

  useEffect(() => {
    if (data?.data) {
      setSummaryContent(data?.data);
    }
  }, [data]);

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

  return (
    <Grid templateColumns="repeat(8, 1fr)" gap="4" p="4" h="full">
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
      <GridItem colSpan={smallScreen ? 8 : 6} overflow="auto">
        <div className="flex justify-center">
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
            <div className="flex  flex-1 overflow-hidden">
              <DashboardXMLViewer input={data?.data} />
            </div>
          )}
        </div>

        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          position="sticky"
          bottom="0"
          bg="white"
          p="2"
          rounded="lg"
        >
          {/* <ActionDock /> */}
          <Flex
            gap="2"
            p="2"
            borderRadius={"lg"}
            border="1px"
            borderColor={"gray.200"}
            alignItems={"center"}
            pt="4"
            flexDir={smallScreen ? "column" : "row"}
          >
            <MediaRecorderButton />
            <Tooltip label="Edit schedule using notes">
              <Button
                leftIcon={<FaPencilAlt />}
                onClick={() => setIsOpen(true)}
                colorScheme="blackAlpha"
                size="sm"
                fontWeight={"normal"}
              >
                {isPending ? "Note submitted Successfully!" : "Text note"}
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem colSpan={smallScreen ? 8 : 2} hidden={smallScreen}>
        <ScheduleNotifications />
      </GridItem>
    </Grid>
  );
}

export default ScheduleSummaryView;
