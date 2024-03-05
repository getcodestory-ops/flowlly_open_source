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
  Select,
  Divider,
} from "@chakra-ui/react";
import MultiSelect from "../MultiSelect/MultiSelect";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { createActivity } from "@/api/activity_routes";
import { CreateNewActivity } from "@/types/activities";
import { MemberEntity } from "@/types/members";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { getMembers } from "@/api/membersRoutes";
import { ActivityEntity } from "@/types/activities";

interface AddNewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddNewActivityModal({ isOpen, onClose }: AddNewActivityModalProps) {
  const toast = useToast();
  const dateToday = getCurrentDateFormatted();
  const { session, activeProject, activities } = useStore((state) => ({
    session: state.session,
    activities: state.userActivities,
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
    status: "On Schedule",
  });

  useEffect(() => {
    setActivity((state) => ({
      ...state!,
      project_id: activeProject?.project_id,
    }));
  }, [activeProject]);

  const queryClient = useQueryClient();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }

      return getMembers(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
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
            <ModalHeader>Create New Activity</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex mb={4} gap={8} flexDirection={"column"}>
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
                {/* owner selection based on member  */}
                <Divider my="4" />
                <Flex gap="8">
                  <MultiSelect
                    title="Assignees"
                    options={members?.data.map((member: MemberEntity) => ({
                      label: `${member.first_name} ${member.last_name}`,
                      id: member.id,
                    }))}
                    onChange={(selectedOptions) => {
                      setActivity((state) => ({
                        ...state!,
                        owner: selectedOptions,
                      }));
                    }}
                  />
                  <MultiSelect
                    title="Depends on"
                    options={activities.map((activity: ActivityEntity) => ({
                      label: `${activity.name}`,
                      id: activity.id,
                    }))}
                    onChange={(selectedOptions) => {
                      setActivity((state) => ({
                        ...state!,
                        dependencies: selectedOptions,
                      }));
                    }}
                  />
                </Flex>
                <Divider my="4" />

                {/* <Select
                  multiple
                  placeholder="Asignees"
                  size="lg"
                  onChange={(e) => {
                    const selectedOptions = e.target.selectedOptions;
                    const values = Array.from(selectedOptions).map(
                      (option) => option.value
                    );
                    setActivity((state) => ({
                      ...state!,
                      owner: values,
                    }));
                  }}
                >
                  {members &&
                    members.data.map((member: MemberEntity) => {
                      return (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      );
                    })}
                </Select> */}

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
                bg={"brand.accent"}
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
