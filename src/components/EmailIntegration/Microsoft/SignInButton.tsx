import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Button, Flex, Heading, useToast } from "@chakra-ui/react";
import { loginRequest } from "./authConfig";
import { FaMicrosoft } from "react-icons/fa";
import { integrateApi, getApiIntegration } from "@/api/integration_routes";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { MdOutlineVerified } from "react-icons/md";

const IntegrateMicrosoft = () => {
  const { instance } = useMsal();
  const toast = useToast();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));

  const { mutate, isPending, data } = useMutation({
    mutationFn: (apiKey: string) => {
      if (!session || !activeProject) {
        console.log("Either session or project is not valid !");
        return Promise.reject("Either session or project is not valid !");
      }
      return integrateApi(session!, activeProject?.project_id, apiKey);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "failed to integrate with Microsoft, try again !",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess: (data) => {},
  });

  const { data: microsoftIntegration, isLoading } = useQuery({
    queryKey: ["getMicrosoftIntegration", session],
    queryFn: () => {
      if (!session || !activeProject)
        return Promise.reject("Either session or project is not valid !");
      return getApiIntegration(
        session!,
        activeProject?.project_id,
        "microsoft"
      );
    },
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  const handleLogin = () => {
    instance
      .loginPopup(loginRequest)
      .catch((e: any) => {
        console.error(`loginPopup failed: ${e}`);
      })
      .then((response) => {
        if (response) {
          mutate(response.accessToken);
          toast({
            title: "Success",
            description: "Integration in progress, please wait !",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        }
      });
  };

  return (
    <Flex flexDirection={"column"} gap="4" w="full">
      <Heading size="msmd" w="full" textAlign={"center"} color="yellow.500">
        Integrate app with external services
      </Heading>
      <Flex>
        <Button
          color="inherit"
          onClick={handleLogin}
          colorScheme={"yellow"}
          leftIcon={<FaMicrosoft />}
          isLoading={isPending}
          isDisabled={isPending}
          rightIcon={
            microsoftIntegration ? (
              <MdOutlineVerified color="green" />
            ) : undefined
          }
        >
          Integrate with Outlook
        </Button>
      </Flex>
    </Flex>
  );
};

export default IntegrateMicrosoft;
