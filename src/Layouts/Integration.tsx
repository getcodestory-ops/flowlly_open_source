import React from "react";
import { Flex } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import IntegrateMicrosoft from "@/components/EmailIntegration/Microsoft/SignInButton";
import IntegrateProcore from "@/components/ProcoreIntegration/SignInButton";

function Integration({ settingView }: { settingView?: string }) {
  const { activeProject, appView, setAppView } = useStore((state) => ({
    activeProject: state.activeProject,
    appView: state.appView,
    setAppView: state.setAppView,
  }));

  return (
    <Flex
      direction={"column"}
      w={"100%"}
      bg={"brand.background"}
      h="full"
      rounded={"xl"}
      p={"4"}
    >
      {activeProject ? (
        <Flex direction={"column"}>
          <Flex direction={"column"} justifyContent={"space-between"}>
            <Flex className="menu" gap="4"></Flex>
          </Flex>
          <Flex flexDirection={"column"} gap="4">
            <IntegrateMicrosoft />
            <IntegrateProcore />
          </Flex>
        </Flex>
      ) : (
        <Flex
          fontSize={"3xl"}
          fontWeight={"black"}
          color={"brand.mid"}
          justifyContent={"center"}
          alignItems={"center"}
          h={"100%"}
        >
          Select or create a project at the top left corner
        </Flex>
      )}
    </Flex>
  );
}

export default Integration;
