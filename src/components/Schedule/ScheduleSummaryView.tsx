import React, { useEffect, useState } from "react";
import {
  Flex,
  Tooltip,
  Button,
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
  useMediaQuery,
} from "@chakra-ui/react";
import {
  getScheduleSummary,
  updateScheduleViaNotes,
} from "@/api/schedule_routes";
// import { getNotifications } from "@/api/update_routes";
import { FaPencilAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useStore } from "@/utils/store";
import { useQuery, useMutation } from "@tanstack/react-query";
import ScheduleNotifications from "../Notifications/ScheduleNotifications";
import ConstructionDashboard from "../ProjectDashboard/ConstructionDashboard";
// import MediaRecorderButton from "../ChatInput/MediaRecorderButton";
// import DashboardXMLViewer from "../ProjectDashboard/DashboardViewer";

function ScheduleSummaryView() {
  const session = useStore((state) => state.session);
  const [smallScreen] = useMediaQuery("(max-width: 1441px)");
  const activeProject = useStore((state) => state.activeProject);

  const [activeEdit, setActiveEdit] = useState(true);
  const [content, setContent] = useState("");
  // const [summaryContent, setSummaryContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  // const { data, isLoading } = useQuery({
  //   queryKey: ["scheduleSummaryDaily", activeProject, session],
  //   queryFn: () => {
  //     if (!session || !activeProject)
  //       return Promise.reject("no session or project");
  //     return getScheduleSummary(session, activeProject.project_id);
  //   },
  //   enabled: !!session,
  // });

  // useEffect(() => {
  //   if (data?.data) {
  //     setSummaryContent(data?.data);
  //   }
  // }, [data]);

  // const { data: notifications } = useQuery({
  //   queryKey: ["projectNotification", activeProject, session],
  //   queryFn: () => {
  //     if (!session || !activeProject)
  //       return Promise.reject("no session or project");
  //     return getNotifications(session, activeProject.project_id);
  //   },
  //   enabled: !!session,
  // });

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
    <div className="flex justify-center h-full overflow-scroll">
      <ConstructionDashboard />
    </div>
  );
}

export default ScheduleSummaryView;
