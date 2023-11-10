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
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createActivity } from "@/api/activity_routes";
import { CreateNewActivity } from "@/types/activities";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";

interface AddNewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddNewActivityModal({ isOpen, onClose }: AddNewActivityModalProps) {
  const toast = useToast();
  const dateToday = getCurrentDateFormatted();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const [activity, setActivity] = useState<CreateNewActivity>({
    name: "",
    description: "",
    start: dateToday,
    project_id: activeProject?.project_id,
    end: dateToday,
    duration: 0,
    cost: 0,
    status: true,
  });

  useEffect(() => {
    setActivity((state) => ({
      ...state!,
      project_id: activeProject?.project_id,
    }));
  }, [activeProject]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!activity) return Promise.reject("No activity");
      return createActivity(session!, activity);
    },
    onError: (error) => {
      console.log(error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityList"] });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {!activeProject && (
          <>
            <ModalHeader> No Project Selected </ModalHeader>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
        {activeProject && (
          <>
            <ModalHeader>Create New Activities</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex mb={4} gap={2} flexDirection={"column"}>
                <Input
                  placeholder="Activity Name"
                  required
                  value={activity?.name}
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
                <Input
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
                />
                {/* <Input
              placeholder="resources"
              value={activity?.cost}
              type="number"
              onChange={(e) => {
                setActivity((state) => ({
                  ...state!,
                  cost: parseFloat(e.target.value),
                }));
              }}
            /> */}
              </Flex>
              <Textarea
                placeholder="Project Description"
                value={activity?.description}
                onChange={(e) =>
                  setActivity((state) => ({
                    ...state!,
                    description: e.target.value,
                  }))
                }
              />
            </ModalBody>{" "}
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  mutation.mutate();
                  onClose();
                }}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default AddNewActivityModal;
