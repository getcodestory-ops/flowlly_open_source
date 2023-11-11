import React, { useRef, useEffect, useState } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  Spinner,
  Toast,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { AiTwotoneAlert } from "react-icons/ai";
import { IoAlertCircleSharp } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { BiSolidCircle } from "react-icons/bi";
import { MdHistoryToggleOff } from "react-icons/md";
import { GrCircleAlert } from "react-icons/gr";

function ScheduleInsights() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { session, activeProject } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
  }));
  const [view, setView] = useState<string>("master");
  const [openHistory, setOpenHistory] = useState<string>("");

  const {
    data: activities,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["activityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }

      return getActivities(session, activeProject.project_id);
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  const activitiesCard = () => {
    // console.log("activities", activities);
    if (!activities) return null;
    const sortedActivities = activities.slice().sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    const historyClick = (id: string) => {
      // console.log("id", id);
      if (openHistory === id) {
        setOpenHistory("");
        return;
      }
      setOpenHistory(id);
    };

    return sortedActivities.map((activity) => (
      <Box
        key={activity.id}
        my={4}
        borderBottom={"2px"}
        borderBottomColor={"brand2.mid"}
        pb={4}
      >
        <Flex direction={"row"} alignItems={"center"}>
          <Icon
            as={BiSolidCircle}
            color={
              activity.status === "Delayed"
                ? "#FF4141"
                : activity.status === "At Risk"
                ? "#FFA841"
                : activity.status === null
                ? "brand2.mid"
                : "#5F55EE"
            }
          />
          <Text fontWeight={"bold"} ml={2}>
            {activity.name}
          </Text>
          <Flex mr={5} paddingLeft={6}>
            <Text as={"i"} fontSize={"sm"}>
              Status:
            </Text>
            <Text fontSize={"sm"} ml={1} fontWeight={"semibold"}>
              {activity.status}
            </Text>
          </Flex>
        </Flex>

        <Flex direction={"row"} paddingLeft={6}>
          <Flex mr={5}>
            <Text as={"i"} fontSize={"sm"}>
              Start Date:
            </Text>
            <Text fontSize={"sm"} ml={1} fontWeight={"semibold"}>
              {activity.start}
            </Text>
          </Flex>
          <Flex>
            <Text as={"i"} fontSize={"sm"}>
              End Date:
            </Text>
            <Text fontSize={"sm"} ml={1} fontWeight={"semibold"}>
              {activity.end}
            </Text>
          </Flex>
        </Flex>
        <Flex direction={"row"} paddingLeft={6}>
          {activity.history !== null ? (
            <Tooltip
              label="Task History"
              aria-label="A tooltip"
              bg={"whote"}
              color={"brand.dark"}
            >
              <Button
                p={0}
                mr={2}
                cursor={"pointer"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => historyClick(activity.id)}
              >
                <Icon as={MdHistoryToggleOff} />
              </Button>
            </Tooltip>
          ) : null}
          {activity.status === "Delayed" || activity.status === "At Risk" ? (
            <Tooltip
              label="Delay Impact"
              aria-label="A tooltip"
              bg={"whote"}
              color={"brand.dark"}
            >
              <Button
                p={0}
                cursor={"pointer"}
                _hover={{ bg: "brand.dark", color: "white" }}
              >
                <Icon as={GrCircleAlert} />
              </Button>
            </Tooltip>
          ) : null}
        </Flex>
        {openHistory === activity.id && activity.history !== null ? (
          <Flex paddingLeft={6}>{activity.history.impact}</Flex>
        ) : null}
      </Box>
    ));
  };

  // useEffect(() => {
  //   if (isSuccess && activities) {
  //     console.log("activities", activities);
  //   }
  // }, [isSuccess, activities]);

  return (
    <Flex>
      <Flex p={10}>
        <Box>
          <Box>
            <Button
              fontSize="sm"
              mr={4}
              bg={`${view === "master" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
            >
              Master Schedule
            </Button>
            <Button
              fontSize="sm"
              bg={`${view === "lookahead" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
            >
              3 Week Lookahead
            </Button>
          </Box>
          <Box
            overflowY={"scroll"}
            overscrollBehaviorY={"contain"}
            height={"88%"}
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {activitiesCard()}
          </Box>
        </Box>
        {/* <Box>
          <Button
            display="flex"
            flexDirection="column"
            marginLeft="10"
            marginRight={5}
            height="70px"
            width="100px"
          >
            <Box display="flex" flexDirection="column" width="full">
              <Box display="flex" justifyContent="flex-start" fontSize="xs">
                <AiTwotoneAlert color="red" />
              </Box>

              <Text fontWeight="bold" fontSize="2xl">
                20
              </Text>
            </Box>
            <Text fontSize="xs">Delayed</Text>
          </Button>
          <Button
            display="flex"
            flexDirection="column"
            height="70px"
            width="100px"
          >
            <Box display="flex" flexDirection="column" width="full">
              <Box display="flex" justifyContent="flex-start" fontSize="xs">
  
                <Icon as={IoAlertCircleSharp} color="brand.accent" />
              </Box>

              <Text fontWeight="bold" fontSize="2xl">
                20
              </Text>
            </Box>
            <Text fontSize="xs">At Risk</Text>
          </Button>
        </Box> */}
      </Flex>
    </Flex>
  );
}

export default ScheduleInsights;
