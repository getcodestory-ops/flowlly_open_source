import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import { createProject } from "@/api/projectRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";

const AddActivityChildren = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const session = useStore((state) => state.session);
  const taskToView = useStore((state) => state.taskToView);
  const activeProject = useStore((state) => state.activeProject);

  if (!taskToView || !session) return null;
  const { mutate, isPending, data } = useMutation({
    mutationFn: () =>
      createProject(session!, {
        name: taskToView.name,
        description: taskToView.description,
        project_type: taskToView.id,
      }),
    onError: (error: any) => {
      if (error && error.response && error.response.data) {
        toast({
          title: "Warning",
          description: `${error.response.data.detail}`,
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data}`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    },
  });

  return (
    <Button
      size={"xs"}
      bg={"brand.dark"}
      color={"white"}
      _hover={{ bg: "brand.light", color: "brand.dark" }}
      onClick={() => mutate()}
    >
      Convert to Project
    </Button>
  );
};

export default AddActivityChildren;
