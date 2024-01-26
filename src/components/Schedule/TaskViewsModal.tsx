import React, { useState } from "react";
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
import { MdHistoryToggleOff, MdInfoOutline } from "react-icons/md";
import { GrCircleAlert } from "react-icons/gr";
import { ActivityEntity } from "@/types/activities";

interface TaskViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskView: string;
  setTaskView: (taskView: string) => void;
  task: ActivityEntity;
}

function TaskViewsModal({
  isOpen,
  onClose,
  taskView,
  task,
  setTaskView,
}: TaskViewsModalProps) {
  // console.log("props", taskView, task);
  return (
    <>
      {task && taskView ? (
        <>
          <ModalOverlay />
          <ModalContent p={"4"} w={"80%"}>
            <ModalCloseButton />
            <ModalHeader>{task.name}</ModalHeader>
            <ModalBody>
              <Flex>
                <Button
                  bg={"white"}
                  size={"sm"}
                  _hover={{ bg: "brand.light" }}
                  onClick={() => setTaskView("history")}
                  mr={"6"}
                >
                  <Flex
                    borderBottom={`${taskView === "history" ? "4px" : "2px"}`}
                    borderBottomColor={`${
                      taskView === "history" ? "brand.accent" : "brand.light"
                    }`}
                    pb={"1"}
                  >
                    <Icon as={MdHistoryToggleOff} mr={"2"} />
                    <Text>Task History</Text>
                  </Flex>
                </Button>
                <Button
                  bg={"white"}
                  size={"sm"}
                  _hover={{ bg: "brand.light" }}
                  onClick={() => setTaskView("impact")}
                  mr={"6"}
                >
                  <Flex
                    borderBottom={`${taskView === "impact" ? "4px" : "2px"}`}
                    borderBottomColor={`${
                      taskView === "impact" ? "brand.accent" : "brand.light"
                    }`}
                    pb={"1"}
                  >
                    <Icon as={GrCircleAlert} mr={"2"} />
                    <Text>Delay Impact</Text>
                  </Flex>
                </Button>
                <Button
                  bg={"white"}
                  size={"sm"}
                  _hover={{ bg: "brand.light" }}
                  onClick={() => setTaskView("details")}
                >
                  <Flex
                    borderBottom={`${taskView === "details" ? "4px" : "2px"}`}
                    borderBottomColor={`${
                      taskView === "details" ? "brand.accent" : "brand.light"
                    }`}
                    pb={"1"}
                  >
                    <Icon as={MdInfoOutline} mr={"2"} />
                    <Text>Task Details</Text>
                  </Flex>
                </Button>
              </Flex>
              <Flex>
                {/* <Text>{task.history && task.history.impact}</Text> */}
              </Flex>
            </ModalBody>
          </ModalContent>
        </>
      ) : null}
    </>
  );
}

export default TaskViewsModal;
