import React, { useEffect, useRef, useState } from "react";
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
  const [risksRSSNeedsScrolling, setRisksRSSNeedsScrolling] = useState(false);
  const [updatesRSSNeedsScrolling, setUpdatesRSSNeedsScrolling] =
    useState(false);
  const [actionsRSSNeedsScrolling, setActionsRSSNeedsScrolling] =
    useState(false);
  const [graphSectionNeedsScrolling, setGraphSectionNeedsScrolling] =
    useState(false);

  const graphSectionRef = useRef(null);
  const riskRSSRef = useRef(null);
  const updateRSSRef = useRef(null);
  const actionRSSRef = useRef(null);

  const checkScrolling = (element: HTMLElement, elementName: string) => {
    const vertical = element.scrollHeight > element.clientHeight;

    // Match each ref with the appropriate state setter
    switch (elementName) {
      case "graphSectionRef":
        setGraphSectionNeedsScrolling(vertical);
        break;
      case "risksRSSRef":
        setRisksRSSNeedsScrolling(vertical);
        break;
      case "updateRSSRef":
        setUpdatesRSSNeedsScrolling(vertical);
        break;
      case "actionRSSRef":
        setActionsRSSNeedsScrolling(vertical);
        break;
      default:
        break;
    }

    console.log(`${elementName} - Vertical scrolling needed: ${vertical}`);
  };

  useEffect(() => {
    // Check if each GridItem needs scrolling after the component mounts
    if (graphSectionRef.current) {
      checkScrolling(graphSectionRef.current, "graphSectionRef");
    }
    if (riskRSSRef.current) {
      checkScrolling(riskRSSRef.current, "risksRSSRef");
    }
    if (updateRSSRef.current) {
      checkScrolling(updateRSSRef.current, "updateRSSRef");
    }
    if (actionRSSRef.current) {
      checkScrolling(actionRSSRef.current, "actionRSSRef");
    }
  }, []);

  useEffect(() => {
    console.log("user activities", userActivities);
  }, [userActivities]);

  useEffect(() => {
    console.log("graphSectionNeedsScrolling", graphSectionNeedsScrolling);
  }, [graphSectionNeedsScrolling]);

  return (
    <Flex w="full" h={"full"}>
      <Grid templateColumns="repeat(5, 1fr)" gap={4} w={"full"}>
        <GridItem
          position="relative"
          ref={graphSectionRef}
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
          {/* {graphSectionNeedsScrolling && (
            <Flex
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bgColor="pink"
              // opacity={0.5}
              justifyContent="center"
              alignItems="center"
              // other styles as needed
              w="100%" // Set width to 100%
              h="30px" // Adjust height as needed
            >
              Test
              
            </Flex>
          )} */}
        </GridItem>

        <GridItem
          colSpan={1}
          overflowY={"auto"}
          className="custom-scrollbar"
          ref={riskRSSRef}
        >
          <RisksRSSsection />
          {/* {risksRSSNeedsScrolling && (
            <Flex
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bgColor="pink"
              opacity={0.5}
              justifyContent="center"
              alignItems="center"
              // other styles as needed
            >
              
            </Flex>
          )} */}
        </GridItem>
        <GridItem
          colSpan={1}
          overflowY={"auto"}
          className="custom-scrollbar"
          ref={updateRSSRef}
        >
          <UpdatesRSSsection />
          {/* {updatesRSSNeedsScrolling && (
            <Flex
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bgColor="pink"
              opacity={0.5}
              justifyContent="center"
              alignItems="center"
              // other styles as needed
            >
              
            </Flex>
          )} */}
        </GridItem>
        <GridItem
          colSpan={1}
          overflowY={"auto"}
          className="custom-scrollbar"
          ref={actionRSSRef}
        >
          <ActionsRSSsection />

          {/* {actionsRSSNeedsScrolling && (
            <Flex
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bgColor="pink"
              opacity={0.5}
              justifyContent="center"
              alignItems="center"
              // other styles as needed
            >
              
            </Flex>
          )} */}
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
