import React from "react";
import {
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalCloseButton,
  Box,
  ModalContent,
  ModalHeader,
  Button,
  Icon,
} from "@chakra-ui/react";
import ScheduleGanttInterface from "./ScheduleGanttInterface";
import ActivitiesDetailPage from "./ActivityDetailsPage";
import { useStore } from "@/utils/store";

function RightPanel() {
  const { rightPanelView, setRightPanelView } = useStore((state) => ({
    rightPanelView: state.rightPanelView,
    setRightPanelView: state.setRightPanelView,
  }));

  return (
    <Flex overflow={"auto"} width="100vw">
      {rightPanelView === "gantt" && <ScheduleGanttInterface />}
      <Flex>{rightPanelView === "task" && <ActivitiesDetailPage />}</Flex>
    </Flex>
  );
}

export default RightPanel;
