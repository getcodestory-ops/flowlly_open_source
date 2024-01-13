import React, { useEffect } from "react";
import { Box, Flex, Icon, Text, Grid, GridItem } from "@chakra-ui/react";
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
import RisksRSSsection from "@/components/ProjectDashboard/RiskRSS";
import UpdatesRSSsection from "@/components/ProjectDashboard/UpdatesRSS";
import ActionsRSSsection from "@/components/ProjectDashboard/ActionsRSS";

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
    <Flex w="full" h={"full"}>
      <Grid templateColumns="repeat(5, 1fr)" gap={4} w={"full"}>
        <GridItem
          colSpan={2}
          overflowX={"auto"}
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
              borderRadius: "8px",
              // backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
          }}
        >
          <GraphSection />
        </GridItem>
        <GridItem colSpan={1} overflowY={"auto"} className="custom-scrollbar">
          <RisksRSSsection />
        </GridItem>
        <GridItem colSpan={1} overflowY={"auto"} className="custom-scrollbar">
          <UpdatesRSSsection />
        </GridItem>
        <GridItem colSpan={1} overflowY={"auto"} className="custom-scrollbar">
          <ActionsRSSsection />
        </GridItem>
      </Grid>
      {/* {activeProject?.name ? (
        <Flex direction={{ base: "column" }} gap="4" w="full">
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
      )} */}
    </Flex>
  );
}

export default ProjectDashboard;
