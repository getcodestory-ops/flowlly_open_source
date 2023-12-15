import React, { useState, useEffect } from "react";
import { Flex, Text, Box, Button, Icon, Tooltip } from "@chakra-ui/react";
import {
  MdHistoryToggleOff,
  MdInfoOutline,
  MdOutlinePlayCircle,
  MdDeleteOutline,
} from "react-icons/md";
import { AiOutlineAlert } from "react-icons/ai";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";
import ActivityEditView from "./ActivityEditView";

import AddActivityChildren from "./AddActivityChildren/AddActivityChildren";

import { getActivityContingencyPlan } from "@/api/activity_routes";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

function ActivitiesDetailPage() {
  const {
    session,
    taskToView,
    setRightPanelView,
    activeProject,
    taskDetailsView,
    setTaskDetailsView,
    userActivities,
  } = useStore((state) => ({
    session: state.session,
    taskToView: state.taskToView,
    setRightPanelView: state.setRightPanelView,
    activeProject: state.activeProject,
    taskDetailsView: state.taskDetailsView,
    setTaskDetailsView: state.setTaskDetailsView,
    userActivities: state.userActivities,
  }));

  type Action = {
    id: string;
    created_at: string;
    contingency_plan: string;
  };

  const queryClient = useQueryClient();
  const [editTask, setEditTask] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([
    {
      contingency_plan: "No remediation plan created.",
      id: "1",
      created_at: "2021-08-10T00:00:00.000Z",
    },
  ]);

  const { data: contingencyPlans } = useQuery({
    queryKey: ["getProjectContingencyPlan", session, activeProject, taskToView],
    queryFn: () => {
      if (!activeProject) return Promise.reject("No active project");
      return getActivityContingencyPlan(
        session!,
        activeProject?.project_id,
        taskToView.id
      );
    },
    enabled: !!session?.access_token,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (contingencyPlans) {
      setActions(contingencyPlans);
    }
  }, [contingencyPlans]);

  const actionsCard = () => {
    let elements = []; // Initialize an empty array

    for (let action of actions) {
      let element = (
        <Flex pl={"4"} direction={"column"}>
          <Flex mb={"2"}>
            <Tooltip
              label="Run action"
              aria-label="A tooltip"
              bg={"white"}
              color={"brand.dark"}
            >
              <Box mr={"2"} cursor={"pointer"}>
                <Icon
                  as={MdOutlinePlayCircle}
                  _hover={{ color: "brand.accent" }}
                />
              </Box>
            </Tooltip>

            <Tooltip
              label="Eliminate action"
              aria-label="A tooltip"
              bg={"white"}
              color={"brand.dark"}
            >
              <Box cursor={"pointer"}>
                <Icon as={MdDeleteOutline} _hover={{ color: "brand.accent" }} />
              </Box>
            </Tooltip>
            <Text fontSize={"sm"} as={"b"} ml={"6"} whiteSpace={"pre-wrap"}>
              {action.contingency_plan}
            </Text>
          </Flex>
        </Flex>
      );

      elements.push(element); // Add the element to the array
    }

    return elements; // Return the array of elements
  };

  const detailsView = () => {
    return (
      <Flex
        ml={"6"}
        direction={"column"}
        overflowY={"auto"}
        overscrollBehaviorY={"contain"}
      >
        <Flex maxW="xl" mb="2"></Flex>
        <Flex
          justifyContent={"space-between"}
          alignItems={"center"}
          minW={"500px"}
        >
          <Flex direction={"column"}>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              Start Date:
            </Text>
            <Text fontSize={"sm"} fontWeight={"semibold"}>
              {taskToView.start}
            </Text>
          </Flex>
          <Flex direction={"column"}>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              End Date:
            </Text>
            <Text fontSize={"sm"} fontWeight={"semibold"}>
              {taskToView.end}
            </Text>
          </Flex>
          <Flex direction={"column"}>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              Duration:
            </Text>
            <Text fontSize={"sm"} fontWeight={"semibold"}>
              {taskToView.duration} days
            </Text>
          </Flex>
          <Flex direction={"column"}>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              Progress:
            </Text>
            <Text fontSize={"sm"} fontWeight={"semibold"}>
              {taskToView.progress}%
            </Text>
          </Flex>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Task Owner:
          </Text>
          <Text
            fontSize={"sm"}
            fontWeight={"semibold"}
            color={`${!taskToView.owner ? "red" : "black"}`}
          >
            {taskToView.owner ? taskToView.owner : "No owner assigned"}
          </Text>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Task Description:
          </Text>
          <Text
            fontSize={"sm"}
            fontWeight={"semibold"}
            color={`${!taskToView.description ? "red" : "black"}`}
          >
            {taskToView && taskToView.description
              ? taskToView.description
              : "This task has no description"}
          </Text>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Task Estimated Cost:
          </Text>
          <Text
            fontSize={"sm"}
            fontWeight={"semibold"}
            color={`${!taskToView.cost ? "red" : "black"}`}
          >
            {taskToView.cost ? taskToView.cost : "No estimated cost assigned"}
          </Text>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Task Resources:
          </Text>
          <Text
            fontSize={"sm"}
            fontWeight={"semibold"}
            color={`${
              !taskToView.resources
                ? "red"
                : taskToView.resources.length > 0
                ? "red"
                : "black"
            }`}
          >
            {taskToView.resources && taskToView.resources.length > 0
              ? taskToView.resources
              : "No resources assigned"}
          </Text>
        </Flex>
      </Flex>
    );
  };

  const historyView = () => {
    return (
      <Flex
        ml={"6"}
        mt={"6"}
        direction={"column"}
        overflowY={"scroll"}
        overscrollBehaviorY={"contain"}
        sx={{
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Flex
          direction={"column"}
          borderBottom={"2px"}
          borderBottomColor={"brand.light"}
          pb={"4"}
        >
          <Flex maxW={"xl"} display="flex" gap="2"></Flex>

          <Flex>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              Date:
            </Text>

            <Text fontSize={"sm"} as={"b"}>
              {taskToView.creation_time &&
                taskToView.creation_time.slice(0, 10)}
            </Text>
          </Flex>
          <Flex>
            <Text fontSize={"sm"} as={"i"} mr={"2"}>
              Action Type:
            </Text>
            <Text fontSize={"sm"} as={"b"}>
              Task Created
            </Text>
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          {taskToView.history &&
            taskToView.history
              .sort((a, b) => {
                // Convert created_at to Date objects for comparison
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);

                // Sort by created_at from newer to older

                return +dateB - +dateA;
              })
              .map((history) => (
                <Flex
                  direction={"column"}
                  borderBottom={"2px"}
                  borderBottomColor={"brand.light"}
                  pb={"4"}
                  pt={"4"}
                  key={history.created_at}
                  pl={"10"}
                >
                  <Flex>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Date:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      {history.created_at}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Action Type:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      Daily Update
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Impact on Schedule:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      {history.severity}
                    </Text>
                  </Flex>

                  <Flex>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Sent By:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      XXXXX
                    </Text>
                  </Flex>
                  <Flex direction={"column"}>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Message:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      {history.message}
                    </Text>
                  </Flex>
                  {/* <Flex>
                    <Text fontSize={"sm"} as={"i"} mr={"2"}>
                      Analysis:
                    </Text>
                    <Text fontSize={"sm"} as={"b"}>
                      {history.impact}
                    </Text>
                  </Flex> */}
                </Flex>
              ))}
        </Flex>
      </Flex>
    );
  };

  const impactView = () => {
    return (
      <Flex
        overflowY={"scroll"}
        overscrollBehaviorY={"contain"}
        sx={{
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
        direction={"column"}
      >
        {taskToView.history &&
          taskToView.history
            .sort((a, b) => {
              // Convert created_at to Date objects for comparison
              const dateA = new Date(a.created_at);
              const dateB = new Date(b.created_at);

              // First, sort by created_at from newer to older
              if (dateA > dateB) return -1;
              if (dateA < dateB) return 1;

              // Then, sort by severity (assuming 'severe' is the highest severity)
              if (a.severity === "severe" && b.severity !== "severe") return -1;
              if (a.severity !== "severe" && b.severity === "severe") return 1;

              // If both are 'severe' or neither, maintain existing order
              return 0;
            })
            .map((history) => (
              <Flex
                direction={"column"}
                borderBottom={"2px"}
                borderBottomColor={"brand.light"}
                pb={"4"}
                m="6"
                key={history.created_at}
                mb={"8"}
                pr={"10"}
              >
                <Flex>
                  <Text fontSize={"sm"} as={"i"} mr={"2"}>
                    Date:
                  </Text>
                  <Text fontSize={"sm"} as={"b"}>
                    {history.created_at.slice(0, 10)}
                  </Text>
                </Flex>
                <Flex mt={"2"}>
                  <Text fontSize={"sm"} as={"i"} mr={"2"}>
                    Severity:
                  </Text>
                  <Text fontSize={"sm"} as={"b"}>
                    {history.severity}
                  </Text>
                </Flex>
                <Flex direction={"column"} mt={"2"}>
                  <Text fontSize={"sm"} as={"i"} mr={"2"}>
                    Impact on Schedule:
                  </Text>
                  <Text fontSize={"sm"} as={"b"} pt={"2"}>
                    {history.impact}
                  </Text>
                </Flex>
                <Flex direction={"column"} mt={"2"}>
                  <Text fontSize={"sm"} as={"i"} mr={"2"}>
                    Suggested Actions:
                  </Text>
                </Flex>
              </Flex>
            ))}
        {actionsCard()}
      </Flex>
    );
  };

  return (
    <>
      {userActivities && userActivities.length > 0 && (
        <Flex direction={"column"} p="10">
          <Flex direction={"column"} zIndex={"1"}>
            <Flex>
              <Button
                bg={`${
                  taskDetailsView === "details" ? "brand.accent" : "brand.light"
                }`}
                size={"sm"}
                _hover={{ bg: "brand.dark", color: "white" }}
                alignContent={"center"}
                mr={"6"}
                onClick={() => setTaskDetailsView("details")}
              >
                <Flex
                  // borderBottom={`${taskView === "details" ? "4px" : "2px"}`}
                  // borderBottomColor={`${
                  //   taskView === "details" ? "brand.accent" : "brand.light"
                  // }`}
                  alignItems={"center"}
                >
                  <Icon as={MdInfoOutline} mr={"2"} />
                  <Text>Task Details</Text>
                </Flex>
              </Button>
              {taskToView.history && (
                <Button
                  bg={`${
                    taskDetailsView === "history"
                      ? "brand.accent"
                      : "brand.light"
                  }`}
                  size={"sm"}
                  _hover={{ bg: "brand.dark", color: "white" }}
                  alignContent={"center"}
                  onClick={() => setTaskDetailsView("history")}
                  mr={"6"}
                >
                  <Flex
                    // borderBottom={`${taskView === "history" ? "4px" : "2px"}`}
                    // borderBottomColor={`${
                    //   taskView === "history" ? "brand.accent" : "brand.light"
                    // }`}

                    alignItems={"center"}
                  >
                    <Icon as={MdHistoryToggleOff} mr={"2"} />
                    <Text>Task History</Text>
                  </Flex>
                </Button>
              )}
              {taskToView.status === "Delayed" ||
              taskToView.status === "At Risk" ? (
                <Button
                  bg={`${
                    taskDetailsView === "impact"
                      ? "brand.accent"
                      : "brand.light"
                  }`}
                  size={"sm"}
                  _hover={{ bg: "brand.dark", color: "white" }}
                  onClick={() => setTaskDetailsView("impact")}
                  mr={"6"}
                >
                  <Flex
                    // borderBottom={`${taskView === "impact" ? "4px" : "2px"}`}
                    // borderBottomColor={`${
                    //   taskView === "impact" ? "brand.accent" : "brand.light"
                    // }`}
                    pb={"1"}
                    alignItems={"center"}
                  >
                    <Icon as={AiOutlineAlert} mr={"2"} />
                    <Text>Delay Impact</Text>
                  </Flex>
                </Button>
              ) : null}
            </Flex>
            {taskToView && (
              <>
                <Flex
                  direction={"row"}
                  alignItems={"baseline"}
                  justifyContent={"space-between"}
                >
                  <Flex direction={"row"} pt={"8"} alignItems={"center"}>
                    <Icon
                      as={BiSolidCircle}
                      mr={"2"}
                      color={
                        taskToView.status === "Delayed"
                          ? "#FF4141"
                          : taskToView.status === "At Risk"
                          ? "#FFA841"
                          : taskToView.status === "In Progress"
                          ? "#5F55EE"
                          : "brand2.dark"
                      }
                    />
                    <Text as={"b"} fontSize={"lg"}>
                      {taskToView.name}
                    </Text>
                  </Flex>

                  {taskDetailsView === "details" && (
                    <>
                      <Button
                        size={"xs"}
                        bg={"brand.dark"}
                        color={"white"}
                        _hover={{ bg: "brand.light", color: "brand.dark" }}
                        onClick={() => setEditTask(!editTask)}
                      >
                        <Text>{editTask ? "Save Changes" : "Edit Task"}</Text>
                      </Button>
                      <AddActivityChildren />
                    </>
                  )}
                </Flex>
                <Flex ml={"6"}>
                  <Text as={"i"} fontSize={"sm"} mr={2}>
                    Status:
                  </Text>
                  <Text
                    as={"b"}
                    fontSize={"sm"}
                    color={
                      taskToView.status === "Delayed"
                        ? "#FF4141"
                        : taskToView.status === "At Risk"
                        ? "#FFA841"
                        : taskToView.status === "In Progress"
                        ? "#5F55EE"
                        : "brand2.dark"
                    }
                  >
                    {taskToView.status}
                  </Text>
                </Flex>
              </>
            )}
          </Flex>

          {taskDetailsView === "history" && historyView()}
          {taskDetailsView === "impact" && impactView()}
          {taskDetailsView === "details" && (
            <>{editTask ? <ActivityEditView /> : detailsView()}</>
          )}
        </Flex>
      )}
    </>
  );
}

export default ActivitiesDetailPage;
