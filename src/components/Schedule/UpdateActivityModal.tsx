import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
  Text,
  Select,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createActivity } from "@/api/activity_routes";
import { UpdateActivityTypes } from "@/types/activities";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { updateActivity } from "@/api/activity_routes";

interface UpdateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any;
  modifyTask: any;
}

function UpdateActivityModal({
  isOpen,
  onClose,
  tasks,
  modifyTask,
}: UpdateActivityModalProps) {
  const toast = useToast();
  const dateToday = getCurrentDateFormatted();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const [activity, setActivity] = useState<UpdateActivityTypes>({
    dependencies: [],
    resources: [],
    status: "",
  });

  //check activity updates
  useEffect(() => {
    console.log("activity", activity);
  }, [activity]);

  // const queryClient = useQueryClient();

  // const mutation = useMutation({
  //   mutationFn: () => {
  //     if (!activity) return Promise.reject("No activity");
  //     return createActivity(session!, activity);
  //   },
  //   onError: (error) => {
  //     console.log(error);
  //   },

  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["activityList"] });
  //   },
  // });

  const updateTask = () => {
    updateActivity(session!, modifyTask.id, activity);
    onClose();
  };

  return (
    // <Modal isOpen={isOpen} onClose={onClose}>
    <>
      <ModalOverlay />
      <ModalContent>
        {!activeProject && (
          <>
            <ModalHeader> No Project Selected </ModalHeader>
            <ModalFooter>
              {/* <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button> */}
            </ModalFooter>
          </>
        )}
        {activeProject && (
          <>
            <ModalCloseButton />
            <ModalHeader>Update Activity: {modifyTask.name}</ModalHeader>
            <ModalBody pb={"6"}>
              <Flex direction={"column"} mb={"2"}>
                <Text as={"b"}>Select task dependency</Text>
                <Select
                  id="dependencies"
                  placeholder="Select dependency"
                  size={"md"}
                  onChange={(e) => {
                    setActivity((state) => ({
                      ...state!,
                      dependencies: [e.target.value],
                    }));
                  }}
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex direction={"column"}>
                <Text as={"b"}>Select task status</Text>
                <Select
                  id="status"
                  placeholder="Select status"
                  size={"md"}
                  onChange={(e) => {
                    setActivity((state) => ({
                      ...state!,
                      status: e.target.value,
                    }));
                  }}
                >
                  <option value={"Pending"}>Pending</option>
                  <option value={"In Progress"}>In Progress</option>
                  <option value={"At Risk"}>At Risk</option>
                  <option value={"Delayed"}>Delayed</option>
                </Select>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Flex direction={"row"}>
                <Button onClick={updateTask} mr={"3"} bg={"brand.accent"}>
                  Update
                </Button>
                <Button bg={"white"} onClick={onClose}>
                  Cancel
                </Button>
              </Flex>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </>
  );
}

export default UpdateActivityModal;
