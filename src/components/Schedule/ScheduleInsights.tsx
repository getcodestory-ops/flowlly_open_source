import React, { useRef, useEffect, useState, use } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  Text,
  Tooltip,
  Select,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";
import { MdHistoryToggleOff, MdInfoOutline } from "react-icons/md";
import { AiOutlineAlert } from "react-icons/ai";

interface OwnerDetails {
  initials: string;
  firstName: string;
  lastName: string;
}

function ScheduleInsights() {
  const {
    activities,
    setRightPanelView,
    setTaskToView,
    setTaskDetailsView,
    taskDetailsView,
    filterView,
    setFilterView,
    taskToView,
    members,
  } = useStore((state) => ({
    activities: state.userActivities,
    setRightPanelView: state.setRightPanelView,
    setTaskToView: state.setTaskToView,
    setTaskDetailsView: state.setTaskDetailsView,
    taskDetailsView: state.taskDetailsView,
    filterView: state.filterView,
    setFilterView: state.setFilterView,
    taskToView: state.taskToView,
    members: state.members,
  }));

  const [openHistory, setOpenHistory] = useState<string>("");

  const [countOfActivities, setCountOfActivities] = useState<number>(0);
  const [countOfDelayed, setCountOfDelayed] = useState<number>(0);
  const [countOfAtRisk, setCountOfAtRisk] = useState<number>(0);
  const [countOfInProgress, setCountOfInProgress] = useState<number>(0);
  const [countOfCompleted, setCountOfCompleted] = useState<number>(0);
  const [countOfOnSchedule, setCountOfOnSchedule] = useState<number>(0);

  useEffect(() => {
    if (taskToView.id !== "SCHEDULE") {
      const updateTaskToView: any = activities.find(
        (activity) => activity.id === taskToView.id
      );
      // console.log("updateTaskToView", updateTaskToView);
      setTaskToView(updateTaskToView);
    }
  }, [activities]);

  const countTotalActivities = (activities: any[]) => {
    let count = 0;
    activities.forEach((activity) => {
      count++;
    });
    setCountOfActivities(count);
  };

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

  function extractOwnerDetails(activity: any, members: any): OwnerDetails[] {
    // Check if owners exist
    if (!activity.owner) {
      return [];
    }

    const ownerDetails: OwnerDetails[] = [];

    activity.owner.forEach((ownerId: any) => {
      const matchingMember = members.find(
        (member: any) => member.id === ownerId
      );

      if (matchingMember) {
        ownerDetails.push({
          initials:
            `${matchingMember.first_name[0]}${matchingMember.last_name[0]}`.toUpperCase(),
          firstName: matchingMember.first_name,
          lastName: matchingMember.last_name,
        });
      }
    });

    return ownerDetails;
  }

  const activitiesCard = () => {
    // console.log("activities", activities);
    if (!activities || !activities.length) return null;
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
      .filter((activity: any) => {
        if (filterView === "Delayed") {
          return activity.status === "Delayed";
        } else if (filterView === "At Risk") {
          return activity.status === "At Risk";
        } else if (filterView === "On Schedule") {
          return activity.status === "On Schedule";
        } else if (filterView === "In Progress") {
          return activity.status === "In Progress";
        } else if (filterView === "Completed") {
          return activity.status === "Completed";
        } else {
          return true;
        }
      })
      .map((activity) => {
        if (!activity) return null;
        return (
          <Box
            key={activity.id}
            // my={4}
            borderBottom={"2px"}
            borderBottomColor={"brand.background"}
            py={4}
            pl={"1"}
            minW={"22vw"}
            bg={activity.id === taskToView?.id ? "yellow.100" : "white"}
            _hover={{ bg: "brand.accent", cursor: "pointer" }}
            onClick={() => detailsClick(activity.id, activity)}
          >
            <Flex direction={"row"} justifyContent={"space-between"}>
              <Flex width={"85%"}>
                <Icon
                  as={BiSolidCircle}
                  color={
                    activity.status === "Delayed"
                      ? "#FF4141"
                      : activity.status === "At Risk"
                      ? "#FFA841"
                      : activity.status === "In Progress"
                      ? "#5f55ee"
                      : activity.status === "Completed"
                      ? "#26d995"
                      : "brand2.dark"
                  }
                  boxSize={"3"}
                />
                <Text fontWeight={"bold"} fontSize={"14px"} ml={2}>
                  {activity.name}
                </Text>
              </Flex>
              <Flex>
                {extractOwnerDetails(activity, members).map((owner, index) => (
                  <Tooltip
                    label={owner?.firstName + " " + owner?.lastName}
                    aria-label="A tooltip"
                    bg="white"
                    color="brand.dark"
                    key={`${index}-details`}
                  >
                    <Flex
                      key={index}
                      bg={"brand.dark"}
                      color={"white"}
                      rounded={"full"}
                      fontSize={"8px"}
                      fontWeight={"bold"}
                      mr={1}
                      mt={"2"}
                      w={"18px"}
                      h={"18px"}
                      alignItems={"center"}
                      justifyContent={"center"}
                    >
                      {owner?.initials}
                    </Flex>
                  </Tooltip>
                ))}
              </Flex>
            </Flex>
            <Flex mr={5} paddingLeft={6}>
              <Text as={"i"} fontSize={"12px"}>
                Status:
              </Text>
              <Text fontSize={"12px"} ml={1} fontWeight={"semibold"}>
                {activity.status}
              </Text>
            </Flex>

            <Flex direction={"row"} paddingLeft={6} mt={"2"}>
              <Flex mr={5} direction={"column"}>
                <Text as={"i"} fontSize={"10px"}>
                  Start Date:
                </Text>
                <Text fontSize={"12px"} ml={1} fontWeight={"semibold"}>
                  {activity.start}
                </Text>
              </Flex>
              <Flex direction={"column"}>
                <Text as={"i"} fontSize={"10px"}>
                  End Date:
                </Text>
                <Text fontSize={"12px"} ml={1} fontWeight={"semibold"}>
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
                      taskDetailsView === "history" &&
                      openHistory === activity.id
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
              {activity.status === "Delayed" ||
              activity.status === "At Risk" ? (
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
                      openHistory === activity.id &&
                      taskDetailsView === "impact"
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
        );
      });
  };

  useEffect(() => {
    // console.log("activities", activities);
    if (activities) {
      countTotalActivities(activities);
      countDelayedActivities(activities);
      countAtRiskActivities(activities);
      countInProgressActivities(activities);
      countCompletedActivities(activities);
      countOnScheduleActivities(activities);
      extractOwnerDetails(activities, members);
      activitiesCard();
    }
  }, [activities]);

  // const quickDataViewCard = (name: string, value: number) => {
  const quickDataViewCard = () => {
    return (
      <Select
        size={"xs"}
        className="custom-selector"
        onChange={(e: any) => setFilterView(e.target.value)}
      >
        <option value="All">All Tasks {countOfActivities}</option>
        <option value="Delayed">Delayed {countOfDelayed}</option>
        <option value="At Risk">At Risk {countOfAtRisk}</option>
        <option value="In Progress">In Progress {countOfInProgress}</option>
        <option value="Completed">Completed {countOfCompleted}</option>
        <option value="On Schedule">On Schedule {countOfOnSchedule}</option>
      </Select>
    );
  };

  return (
    <Flex>
      <Flex direction={"column"}>
        <Flex alignItems={"center"}>
          <Flex fontSize={"12px"} fontWeight={"bold"}>
            Filter:
          </Flex>
          <Flex direction={"column"}>{quickDataViewCard()}</Flex>
        </Flex>
        <Flex
          // overflowY={"scroll"}
          // overscrollBehaviorY={"contain"}
          // sx={{
          //   "::-webkit-scrollbar": {
          //     display: "none",
          //   },
          // }}
          direction={"column"}
        >
          {activitiesCard()}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ScheduleInsights;
