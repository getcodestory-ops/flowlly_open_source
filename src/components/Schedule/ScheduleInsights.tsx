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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { getActivities } from "@/api/activity_routes";
import { BiSolidCircle } from "react-icons/bi";
import { MdHistoryToggleOff, MdInfoOutline } from "react-icons/md";
import { GrCircleAlert } from "react-icons/gr";

import { useScheduleUpdate } from "@/components/Agent/useAgentFunctions";
import { AiOutlineAlert } from "react-icons/ai";
import { ActivityEntity } from "@/types/activities";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import CustomDatePicker from "../DatePicker/DatePicker";
import { G } from "@react-pdf/renderer";

function ScheduleInsights() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    session,
    activeProject,
    activities,
    setRightPanelView,
    setTaskToView,
    setTaskDetailsView,
    taskDetailsView,
    filterView,
    setFilterView,
    scheduleDate,
    scheduleProbability,
    setScheduleProbability,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    activities: state.userActivities,
    setRightPanelView: state.setRightPanelView,
    setTaskToView: state.setTaskToView,
    setTaskDetailsView: state.setTaskDetailsView,
    taskDetailsView: state.taskDetailsView,
    filterView: state.filterView,
    setFilterView: state.setFilterView,
    scheduleDate: state.scheduleDate,
    scheduleProbability: state.scheduleProbability,
    setScheduleProbability: state.setScheduleProbability,
  }));
  const [view, setView] = useState<string>("master");
  const [openHistory, setOpenHistory] = useState<string>("");
  const { isOpen, onClose, onOpen } = useScheduleUpdate();
  const [taskView, setTaskView] = useState<string>("");

  const [countOfDelayed, setCountOfDelayed] = useState<number>(0);
  const [countOfAtRisk, setCountOfAtRisk] = useState<number>(0);
  const [countOfInProgress, setCountOfInProgress] = useState<number>(0);
  const [countOfCompleted, setCountOfCompleted] = useState<number>(0);
  const [countOfOnSchedule, setCountOfOnSchedule] = useState<number>(0);
  // const [filteredView, setFilteredView] = useState<string>("none");
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);

  // const {
  //   data: activities,
  //   isLoading,
  //   isSuccess,
  // } = useQuery({
  //   queryKey: [
  //     "activityList",
  //     session,
  //     activeProject,
  //     scheduleDate,
  //     scheduleProbability,
  //   ],
  //   queryFn: () => {
  //     if (!session || !activeProject) {
  //       return Promise.reject("Set session first !");
  //     }
  //     const date = getCurrentDateFormatted(scheduleDate || new Date());
  //     return getActivities(
  //       session,
  //       activeProject.project_id,
  //       date,
  //       scheduleProbability
  //     );
  //   },

  //   enabled: !!session?.access_token && !!activeProject?.project_id,
  // });

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

  const countInProgressActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      if (activity.status === "In Progress") {
        count++;
      }
    });
    setCountOfInProgress(count);
  };

  const countCompletedActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      if (activity.status === "Completed") {
        count++;
      }
    });
    setCountOfCompleted(count);
  };

  const countOnScheduleActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      if (activity.status === "On Schedule") {
        count++;
      }
    });
    setCountOfOnSchedule(count);
  };

  useEffect(() => {
    // console.log("activities", activities);
    if (activities) {
      countDelayedActivities(activities);
      countAtRiskActivities(activities);
      countInProgressActivities(activities);
      countCompletedActivities(activities);
      countOnScheduleActivities(activities);
    }
  }, [activities]);

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
                  : "brand2.dark"
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
        rounded={"full"}
        px={"2"}
        py={"0.5"}
        // minW={"120px"}
        // maxH={"150px"}
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
        <Flex direction={"row"} alignItems={"center"}>
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
                  : name === "In Progress"
                  ? "#5F55EE"
                  : name === "Completed"
                  ? "#00B87C"
                  : name === "On Schedule"
                  ? "#FFFFFF"
                  : "brand2.mid"
              }
            />
            <Text fontSize={"xs"}>{name}</Text>
          </Flex>
          <Text fontSize={"md"} as={"b"} ml={2}>
            {value}
          </Text>
        </Flex>
      </Flex>
    );
  };

  const probabilitySlider = () => {
    return (
      <Slider
        id="slider"
        defaultValue={5}
        min={0}
        max={100}
        colorScheme="blackAlpha"
        onChange={(v) => setSliderValue(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
          25%
        </SliderMark>
        <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
          50%
        </SliderMark>
        <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
          75%
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          bg="brand.dark"
          color="white"
          placement="top"
          isOpen={showTooltip}
          label={`${sliderValue}%`}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
    );
  };

  useEffect(() => {
    setScheduleProbability(sliderValue / 100);
  }, [sliderValue]);

  return (
    <Flex>
      <Flex pt={10} px={"10"}>
        <Flex direction={"column"}>
          <Flex
            // borderTop={"2px"}
            borderBottom={"2px"}
            pb={"6"}
            mb={"6"}
            borderColor={"gray.200"}
            minW={"500px"}
            justifyContent={"space-around"}
          >
            <Flex
              direction={"column"}
              w={"30%"}
              alignItems={"center"}
              justifyItems={"center"}
            >
              <Text fontSize={"sm"} as={"b"}>
                Impactful events
              </Text>
              <Flex>
                <CustomDatePicker />
              </Flex>
            </Flex>
            <Flex
              direction={"column"}
              w={"60%"}
              alignItems={"center"}
              justifyItems={"center"}
            >
              <Text fontSize={"sm"} as={"b"}>
                Impact Probability
              </Text>
              <Flex w={"80%"}>{probabilitySlider()}</Flex>
            </Flex>
          </Flex>

          <Flex mb={"4"}>
            {quickDataViewCard("Delayed", countOfDelayed)}
            {quickDataViewCard("At Risk", countOfAtRisk)}
            {quickDataViewCard("In Progress", countOfInProgress)}
            {quickDataViewCard("Completed", countOfCompleted)}
            {quickDataViewCard("On Schedule", countOfOnSchedule)}
          </Flex>
          <Flex
            overflowY={"scroll"}
            overscrollBehaviorY={"contain"}
            // minH={"98%"}
            maxH={"100%"}
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
