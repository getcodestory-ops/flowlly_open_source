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
  Modal,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { BiSolidCircle } from "react-icons/bi";
import { MdHistoryToggleOff, MdInfoOutline } from "react-icons/md";
import { GrCircleAlert } from "react-icons/gr";
import TaskViewsModal from "./TaskViewsModal";
import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";
import { AiOutlineAlert } from "react-icons/ai";

function ScheduleInsights() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    session,
    activeProject,
    setRightPanelView,
    setTaskToView,
    setTaskDetailsView,
    taskDetailsView,
    filterView,
    setFilterView,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setRightPanelView: state.setRightPanelView,
    setTaskToView: state.setTaskToView,
    setTaskDetailsView: state.setTaskDetailsView,
    taskDetailsView: state.taskDetailsView,
    filterView: state.filterView,
    setFilterView: state.setFilterView,
  }));
  const [view, setView] = useState<string>("master");
  const [openHistory, setOpenHistory] = useState<string>("");
  const { isOpen, onClose, onOpen } = useScheduleUpdate();
  const [taskView, setTaskView] = useState<string>("");
  const [task, setTask] = useState<Object>({});
  const [countOfDelayed, setCountOfDelayed] = useState<number>(0);
  const [countOfAtRisk, setCountOfAtRisk] = useState<number>(0);
  // const [filteredView, setFilteredView] = useState<string>("none");

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

  const countDelayedActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      if (activity.status === "Delayed") {
        count++;
      }
    });
    setCountOfDelayed(count);
  };

  const countAtRiskActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      if (activity.status === "At Risk") {
        count++;
      }
    });
    setCountOfAtRisk(count);
  };

  useEffect(() => {
    // console.log("activities", activities);
    if (isSuccess && activities) {
      countDelayedActivities(activities);
      countAtRiskActivities(activities);
    }
  }, [activities, isSuccess]);

  const activitiesCard = () => {
    // console.log("activities", activities);
    if (!activities) return null;
    const sortedActivities = activities.slice().sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    const historyClick = (id: string, activity: any) => {
      // console.log("id", id);
      // console.log("activity", activity);
      setTaskToView(activity);
      setTaskDetailsView("history");
      setRightPanelView("task");
      setOpenHistory(id);
    };

    const impactClick = (id: string, activity: any) => {
      // console.log("id", id);
      // console.log("activity", activity);
      setTaskToView(activity);
      setTaskDetailsView("impact");
      setRightPanelView("task");
      setOpenHistory(id);
    };

    const detailsClick = (id: string, activity: any) => {
      // console.log("id", id);
      // console.log("activity", activity);
      setTaskToView(activity);
      setTaskDetailsView("details");
      setRightPanelView("task");
      setOpenHistory(id);
    };

    return sortedActivities
      .filter((activity) => {
        if (filterView === "Delayed") {
          return activity.status === "Delayed";
        } else if (filterView === "At Risk") {
          return activity.status === "At Risk";
        } else {
          return true;
        }
      })
      .map((activity) => (
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
                  : activity.status === "In Progress"
                  ? "#5F55EE"
                  : "brand2.mid"
              }
            />
            <Text fontWeight={"bold"} ml={2}>
              {activity.name}
            </Text>
          </Flex>
          <Flex mr={5} paddingLeft={6}>
            <Text as={"i"} fontSize={"sm"}>
              Status:
            </Text>
            <Text fontSize={"sm"} ml={1} fontWeight={"semibold"}>
              {activity.status}
            </Text>
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
          <Flex direction={"row"} paddingLeft={6} mt={2}>
            <Tooltip
              label="Task Details"
              aria-label="A tooltip"
              bg={"white"}
              color={"brand.dark"}
            >
              <Button
                p={0}
                mr={2}
                cursor={"pointer"}
                bg={`${
                  taskDetailsView === "details" && openHistory === activity.id
                    ? "brand.accent"
                    : "brand2.mid"
                }`}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => detailsClick(activity.id, activity)}
              >
                <Icon as={MdInfoOutline} />
              </Button>
            </Tooltip>
            {activity.history !== null ? (
              <Tooltip
                label="Task History"
                aria-label="A tooltip"
                bg={"white"}
                color={"brand.dark"}
              >
                <Button
                  p={0}
                  mr={2}
                  cursor={"pointer"}
                  bg={`${
                    taskDetailsView === "history" && openHistory === activity.id
                      ? "brand.accent"
                      : "brand2.mid"
                  }`}
                  _hover={{ bg: "brand.dark", color: "white" }}
                  onClick={() => historyClick(activity.id, activity)}
                >
                  <Icon as={MdHistoryToggleOff} />
                </Button>
              </Tooltip>
            ) : null}
            {activity.status === "Delayed" || activity.status === "At Risk" ? (
              <Tooltip
                label="Delay Impact"
                aria-label="A tooltip"
                bg={"white"}
                color={"brand.dark"}
              >
                <Button
                  p={0}
                  cursor={"pointer"}
                  bg={`${
                    openHistory === activity.id && taskDetailsView === "impact"
                      ? "brand.accent"
                      : "brand2.mid"
                  }`}
                  _hover={{ bg: "brand.dark", color: "white" }}
                  onClick={() => impactClick(activity.id, activity)}
                >
                  <Icon as={AiOutlineAlert} />
                </Button>
              </Tooltip>
            ) : null}
          </Flex>
        </Box>
      ));
  };

  const quickDataViewCard = (name: string, value: number) => {
    return (
      <Flex
        bg={
          name === "Delayed" && filterView === "Delayed"
            ? "brand.accent"
            : name === "At Risk" && filterView === "At Risk"
            ? "brand.accent"
            : "brand.light"
        }
        borderRadius={"lg"}
        px={"2"}
        py={"0.5"}
        w={"90px"}
        justifyContent={"center"}
        mr={"4"}
        cursor={"pointer"}
        _hover={{ bg: "brand.dark", color: "white" }}
        onClick={() => {
          if (filterView === name) {
            setFilterView("none");
          } else {
            setFilterView(name);
          }
        }}
      >
        <Flex direction={"column"} alignItems={"center"}>
          <Flex alignItems={"center"}>
            <Icon
              as={BiSolidCircle}
              w={"10px"}
              mr={"1"}
              color={
                name === "Delayed"
                  ? "#FF4141"
                  : name === "At Risk"
                  ? "#FFA841"
                  : "brand2.mid"
              }
            />
            <Text fontSize={"sm"}>{name}</Text>
          </Flex>
          <Text fontSize={"lg"} as={"b"}>
            {value}
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <TaskViewsModal
          isOpen={isOpen}
          onClose={onClose}
          task={task}
          taskView={taskView}
          setTaskView={setTaskView}
        />
      </Modal>
      <Flex p={10}>
        <Flex direction={"column"}>
          {/* <Box>
            <Button
              size={"sm"}
              mr={4}
              bg={`${view === "master" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
            >
              Master Schedule
            </Button>
            <Button
              size={"sm"}
              bg={`${view === "lookahead" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
            >
              3 Week Lookahead
            </Button>
          </Box> */}
          <Flex mb={"4"}>
            {quickDataViewCard("Delayed", countOfDelayed)}
            {quickDataViewCard("At Risk", countOfAtRisk)}
          </Flex>
          <Flex
            overflowY={"scroll"}
            overscrollBehaviorY={"contain"}
            minH={"98%"}
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
            direction={"column"}
          >
            {activitiesCard()}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ScheduleInsights;
