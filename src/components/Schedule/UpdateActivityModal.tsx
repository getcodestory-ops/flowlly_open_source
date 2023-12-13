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
import getCurrentDateFormatted, {
  dateDiffInDays,
} from "@/utils/getCurrentDateFormatted";
import { updateActivity } from "@/api/activity_routes";
import { ActivityEntity } from "@/types/activities";
import type { Task } from "gantt-task-react";

interface UpdateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ActivityEntity[];
  modifyTask: Task;
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

  const [activity, setActivity] = useState<UpdateActivityTypes>();

  //check activity updates
  useEffect(() => {
    setActivity({
      id: modifyTask.id,
      name: modifyTask.name,
      description: "",
      duration: dateDiffInDays(modifyTask.start, modifyTask.end),
      start: getCurrentDateFormatted(modifyTask.start),
      project_id: activeProject?.project_id,
      end: getCurrentDateFormatted(modifyTask.end),
      dependencies: [],
      resources: [],
      status: "",
    });
  }, [modifyTask]);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (activity: UpdateActivityTypes) => {
      if (!activity || !activeProject) return Promise.reject("No activity");
      return updateActivity(session!, activeProject.project_id, activity);
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error updating activity",
        description: error.message,
        status: "error",
        duration: 4000,

        isClosable: true,
      });
    },

    onSuccess: () => {
      toast({
        title: "Activity updated",
        description: "Activity has been updated",
        status: "success",
        duration: 4000,

        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    },
  });

  const updateTask = () => {
    if (!activity) return;
    mutate(activity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
        {activeProject && activity && (
          <>
            <ModalCloseButton />
            <ModalHeader>Update Activity</ModalHeader>
            <ModalBody pb={"6"}>
              <Flex direction={"column"} mb={"2"}>
                <Flex mb={4} gap={2} flexDirection={"column"}>
                  <Input
                    placeholder="Activity Name"
                    required
                    value={activity.name}
                    onChange={(e) => {
                      setActivity((state) => ({
                        ...state!,
                        name: e.target.value,
                      }));
                    }}
                  />
                  <Input
                    placeholder="Activity Duration (Days)"
                    value={activity.duration === 0 ? "" : activity.duration}
                    type="number"
                    step={0.01}
                    onChange={(e) => {
                      if (!e.target.value) e.target.value = "0";
                      setActivity((state) => ({
                        ...state!,
                        duration: parseFloat(e.target.value) ?? 0,
                      }));
                    }}
                  />
                  <Input
                    placeholder="Start Date"
                    type="date"
                    value={activity.start}
                    onChange={(e) => {
                      if (e.target.value > activity.end) {
                        return toast({
                          title: "Invalid date range",
                          description: "Start date cannot be after end date",
                          status: "error",
                          duration: 9000,

                          isClosable: true,
                        });
                      }

                      setActivity((state) => ({
                        ...state!,
                        start: e.target.value,
                      }));
                    }}
                  />
                  <Input
                    placeholder="End Date"
                    type="date"
                    value={activity ? activity.end : ""}
                    onChange={(e) => {
                      if (e.target.value < activity.start) {
                        return toast({
                          title: "Invalid date range",
                          description: "Start date cannot be after end date",
                          status: "error",
                          duration: 9000,

                          isClosable: true,
                        });
                      }

                      setActivity((state) => ({
                        ...state!,
                        end: e.target.value,
                      }));
                    }}
                  />
                  {/* <Input
                    placeholder="Cost"
                    value={activity.cost === 0 ? "" : activity.cost}
                    type={activity.cost ? "number" : "text"}
                    onChange={(e) => {
                      if (!e.target.value) e.target.value = "0";
                      setActivity((state) => ({
                        ...state!,
                        cost: parseFloat(e.target.value),
                      }));
                    }}
                  /> */}
                </Flex>
                {/* <Textarea
                  placeholder="Project Description"
                  value={activity.description}
                  onChange={(e) =>
                    setActivity((state) => ({
                      ...state!,
                      description: e.target.value,
                    }))
                  }
                /> */}
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
    </Modal>
  );
}

export default UpdateActivityModal;
