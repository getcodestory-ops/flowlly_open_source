import React, { useEffect } from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import dynamic from "next/dynamic";
const Chart = dynamic(
  () => import("react-apexcharts").then((mod) => mod.default),
  {
    ssr: false,
  }
);
import { BiSolidCircle } from "react-icons/bi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import TopBar from "@/components/TopBar";
import { useStore } from "@/utils/store";
import GraphSection from "@/components/ProjectDashboard/GraphsSection";
import RSSsection from "@/components/ProjectDashboard/RSSsection";

function ProjectDashboard() {
  const {
    session,
    activeProject,
    setActiveProject,
    activeChatEntity,
    setActiveChatEntity,
    userActivities,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    userActivities: state.userActivities,
  }));

  useEffect(() => {
    console.log("user activities", userActivities);
  }, [userActivities]);

  return (
    <Flex pl={"10"} w="full">
      {activeProject?.name ? (
        <Flex direction={{ base: "column" }} gap="4" w="full">
          <Flex direction={"column"}>
            <Flex
              direction={"row"}
              fontSize={"md"}
              gap="2"
              alignItems={"center"}
              color={"#FFA840"}
            >
              <Icon as={BiSolidCircle} />
              <Text as={"b"}>At Risk</Text>
            </Flex>
          </Flex>
          <Flex w="full" direction={{ base: "column-reverse", md: "row" }}>
            <Flex>
              <GraphSection />
            </Flex>
            <Flex w={{ md: "25%" }} pl="2">
              <RSSsection />
            </Flex>
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
          Select a project at the top left corner
        </Flex>
      )}
    </Flex>
  );
}

export default ProjectDashboard;
