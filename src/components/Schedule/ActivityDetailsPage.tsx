import React, { useState } from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
// import { MdOutlinePlayCircle, MdDeleteOutline } from "react-icons/md";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";
// import { activityEntityToTask } from "@/utils/activityEntityToTask";
// import { getActivityContingencyPlan } from "@/api/activity_routes";
// import { useQuery, keepPreviousData } from "@tanstack/react-query";
import UpdateActivityModal from "./UpdateActivityModal";
import { ActivityEntity } from "@/types/activities";
import EditScheduleThroughNotes from "./EditScheduleThroughNote/EditScheduleThroughNote";
import { useDeleteActivity } from "@/utils/useDeleteActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityEntityWithMembers } from "@/utils/mapOwnerToMembers";

function ActivitiesDetailPage() {
  const handleTaskDelete = useDeleteActivity();

  const {
    // session,
    taskToView,
    // activeProject,
    // taskDetailsView,
    // setTaskDetailsView,
    userActivities,
    // members,
  } = useStore((state) => ({
    session: state.session,
    taskToView: state.taskToView,
    setRightPanelView: state.setRightPanelView,
    activeProject: state.activeProject,
    taskDetailsView: state.taskDetailsView,
    setTaskDetailsView: state.setTaskDetailsView,
    userActivities: state.userActivities,
    members: state.members,
    scheduleDate: state.scheduleDate,
    setTaskToView: state.setTaskToView,
  }));

  // type Action = {
  //   id: string;
  //   created_at: string;
  //   contingency_plan: string;
  // };

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [modifyTask, setModifyTask] = useState<ActivityEntity>();
  const [editTask, setEditTask] = useState<boolean>(false);
  // const [tasks, setTasks] = useState<any[]>(userActivities);
  // const [actions, setActions] = useState<Action[]>([
  //   {
  //     contingency_plan: "No remediation plan created.",
  //     id: "1",
  //     created_at: "2021-08-10T00:00:00.000Z",
  //   },
  // ]);

  // const { data: contingencyPlans } = useQuery({
  //   queryKey: ["getProjectContingencyPlan", session, activeProject, taskToView],
  //   queryFn: () => {
  //     if (!activeProject || !taskToView)
  //       return Promise.reject("No active project");
  //     return getActivityContingencyPlan(
  //       session!,
  //       activeProject?.project_id,
  //       taskToView.id
  //     );
  //   },
  //   enabled: !!session?.access_token,
  //   placeholderData: keepPreviousData,
  // });

  const handleEdit = (
    activity: ActivityEntityWithMembers | ActivityEntity,
    newStatus: string
  ) => {
    if (!activity) return;
    console.log(activity);

    if (activity.owner) {
      const ownerIds = activity.owner.map((owner) => {
        if (typeof owner === "string") return owner;
        return owner.id;
      });
      setModifyTask({
        ...activity,
        owner: ownerIds,
        status: newStatus,
      });
      setEditOpen(true);
      return;
    }
  };

  // useEffect(() => {
  //   if (contingencyPlans) {
  //     setActions(contingencyPlans);
  //   }
  // }, [contingencyPlans]);

  // useEffect(() => {
  //   if (userActivities) {
  //     if (userActivities.length > 0) {
  //       // console.log("activities", activities);
  //       const transformedTasks = userActivities
  //         .map(activityEntityToTask)
  //         .sort((a, b) => a.start.getTime() - b.start.getTime()); // Assuming the data you want is in activities.data
  //       setTasks(transformedTasks);
  //     } else {
  //       const currentDate = new Date();
  //       setTasks([
  //         {
  //           start: new Date(
  //             currentDate.getFullYear(),
  //             currentDate.getMonth(),
  //             currentDate.getDate()
  //           ),
  //           end: new Date(
  //             currentDate.getFullYear(),
  //             currentDate.getMonth(),
  //             currentDate.getDate()
  //           ),
  //           name: "No data available",
  //           id: "ProjectSample",
  //           progress: 0,
  //           type: "project",
  //           hideChildren: false,
  //           displayOrder: 1,
  //         },
  //       ]);
  //     }
  //   }
  // }, [userActivities]);

  // const actionsCard = () => {
  //   return (
  //     <>
  //       {actions.map((action: Action, index: number) => (
  //         <Flex pl={"4"} direction={"column"} key={`actions-${index}`}>
  //           <Flex mb={"2"}>
  //             <Tooltip
  //               label="Run action"
  //               aria-label="A tooltip"
  //               bg={"white"}
  //               color={"brand.dark"}
  //             >
  //               <Box mr={"2"} cursor={"pointer"}>
  //                 <Icon
  //                   as={MdOutlinePlayCircle}
  //                   _hover={{ color: "brand.accent" }}
  //                 />
  //               </Box>
  //             </Tooltip>

  //             <Tooltip
  //               label="Eliminate action"
  //               aria-label="A tooltip"
  //               bg={"white"}
  //               color={"brand.dark"}
  //             >
  //               <Box cursor={"pointer"}>
  //                 <Icon
  //                   as={MdDeleteOutline}
  //                   _hover={{ color: "brand.accent" }}
  //                 />
  //               </Box>
  //             </Tooltip>
  //             <Text fontSize={"sm"} as={"b"} ml={"6"} whiteSpace={"pre-wrap"}>
  //               {action.contingency_plan}
  //             </Text>
  //           </Flex>
  //         </Flex>
  //       ))}
  //     </>
  //   );
  // };

  const detailsView = () => {
    return (
      <Flex
        // ml={"6"}
        direction={"column"}
        overflowY={"auto"}
        overscrollBehaviorY={"contain"}
        fontSize={"12px"}
        maxW="xl"
      >
        <Flex maxW="xl" mb="2"></Flex>
        <Flex
          justifyContent={"space-between"}
          alignItems={"center"}
          minW={"500px"}
        >
          <Flex direction={"column"}>
            <Text as={"i"} mr={"2"}>
              Start Date:
            </Text>
            <Text fontWeight={"semibold"}>{taskToView?.start}</Text>
          </Flex>
          <Flex direction={"column"}>
            <Text as={"i"} mr={"2"}>
              End Date:
            </Text>
            <Text fontWeight={"semibold"}>{taskToView?.end}</Text>
          </Flex>
          <Flex direction={"column"}>
            <Text as={"i"} mr={"2"}>
              Duration:
            </Text>
            <Text fontWeight={"semibold"}>{taskToView?.duration} days</Text>
          </Flex>
          {/* <Flex direction={"column"}>
            <Text as={"i"} mr={"2"}>
              Progress:
            </Text>
            <Text fontWeight={"semibold"}>{taskToView.progress}%</Text>
          </Flex> */}
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text as={"i"} mr={"2"}>
            Task Owner:
          </Text>
          <Text
            fontWeight={"semibold"}
            color={`${!taskToView?.owner ? "red" : "black"}`}
          >
            {taskToView &&
              taskToView.owner &&
              taskToView.owner.length &&
              (taskToView.owner
                .map(
                  (member) =>
                    typeof member !== "string" &&
                    `${member.first_name} ${member.last_name}`
                )
                .join(" ") ??
                "No owner assigned")}
          </Text>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          <Text as={"i"} mr={"2"}>
            Task Description:
          </Text>
          <Text
            fontWeight={"semibold"}
            color={`${!taskToView?.description ? "red" : "black"}`}
          >
            {taskToView && taskToView.description
              ? taskToView.description
              : "This task has no description.."}
          </Text>
        </Flex>
        <Flex direction={"column"} mt={"4"}>
          {taskToView && (
            <EditScheduleThroughNotes activityName={taskToView.name} />
          )}
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
        fontSize={"12px"}
      >
        <Flex
          direction={"column"}
          borderBottom={"2px"}
          borderBottomColor={"brand.light"}
          pb={"4"}
        >
          <Flex maxW={"xl"} display="flex" gap="2"></Flex>

          <Flex>
            <Text as={"i"} mr={"2"}>
              Date:
            </Text>

            <Text as={"b"}>
              {taskToView?.creation_time &&
                taskToView.creation_time.slice(0, 10)}
            </Text>
          </Flex>

          <Flex>
            <Text as={"i"} mr={"2"}>
              Action Type:
            </Text>
            <Text as={"b"}>Task Created</Text>
          </Flex>
        </Flex>
        <Flex direction={"column"} maxH="prose" maxW="md" overflow={"auto"}>
          {taskToView?.history &&
            taskToView.history
              .sort((a, b) => {
                // Convert created_at to Date objects for comparison
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);

                // Sort by created_at from newer to older

                return +dateB - +dateA;
              })
              .map((history, index) => (
                <Flex
                  key={`history-${index}`}
                  direction={"column"}
                  borderBottom={"2px"}
                  borderBottomColor={"brand.light"}
                  pb={"4"}
                  pt={"4"}
                  pl={"10"}
                >
                  {history && (
                    <>
                      <Flex>
                        <Text as={"i"} mr={"2"}>
                          Date:
                        </Text>
                        <Text as={"b"}>{history.created_at ?? ""}</Text>
                      </Flex>
                      <Flex>
                        <Text as={"i"} mr={"2"}>
                          Action Type:
                        </Text>
                        <Text as={"b"}>Daily Update</Text>
                      </Flex>
                      <Flex>
                        <Text as={"i"} mr={"2"}>
                          Impact on Schedule:
                        </Text>
                        <Text as={"b"}>{history.severity ?? ""}</Text>
                      </Flex>

                      <Flex>
                        <Text as={"i"} mr={"2"}>
                          Sent By:
                        </Text>
                        <Text as={"b"}>XXXXX</Text>
                      </Flex>
                      <Flex direction={"column"}>
                        <Text as={"i"} mr={"2"}>
                          Message:
                        </Text>
                        <Text as={"b"}>
                          {history.message ?? history.impact ?? ""}
                        </Text>
                      </Flex>
                    </>
                  )}
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
        fontSize={"12px"}
        maxH="prose"
        maxW="md"
        overflow="scroll"
      >
        {taskToView?.history &&
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
            .map((history, index) => (
              <div
                key={`view-task-history-${history?.impact ?? index}-${index}`}
              >
                {history && (
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
                      <Text as={"i"} mr={"2"}>
                        Date:
                      </Text>
                      <Text as={"b"}>{history.created_at?.slice(0, 10)}</Text>
                    </Flex>
                    <Flex mt={"2"}>
                      <Text as={"i"} mr={"2"}>
                        Severity:
                      </Text>
                      <Text as={"b"}>{history.severity}</Text>
                    </Flex>
                    <Flex direction={"column"} mt={"2"}>
                      <Text as={"i"} mr={"2"}>
                        Impact on Schedule:
                      </Text>
                      <Text as={"b"} pt={"2"}>
                        {history.impact}
                      </Text>
                    </Flex>
                    <Flex direction={"column"} mt={"2"}>
                      <Text as={"i"} mr={"2"}>
                        Suggested Actions:
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </div>
            ))}
        {/* {actionsCard()} */}
      </Flex>
    );
  };

  return (
    <>
      {userActivities && userActivities.length > 0 && taskToView && (
        <div className="flex flex-col w-full px-8 py-2 rounded-lg overflow-scroll">
          {modifyTask && editOpen && (
            <UpdateActivityModal
              isOpen={editOpen}
              onClose={() => setEditOpen(false)}
              tasks={userActivities}
              modifyTask={modifyTask}
            />
          )}
          <div>
            <div className="flex flex-col w-96">
              {taskToView && (
                <>
                  <Flex
                    direction={"row"}
                    alignItems={"baseline"}
                    justifyContent={"space-between"}
                  >
                    <div className="flex items-center">
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
                            : taskToView.status === "Completed"
                            ? "#26d995"
                            : "brand2.dark"
                        }
                        boxSize={"3"}
                      />
                      <div className="font-bold text-sm min-h-12 flex items-center">
                        {taskToView?.name}
                      </div>
                    </div>

                    <>
                      <Flex gap="4">
                        <Button
                          size={"sm"}
                          variant={"outline"}
                          onClick={() => handleEdit(taskToView, "In Progress")}
                        >
                          <Text>{editTask ? "Save Changes" : "Edit Task"}</Text>
                        </Button>
                        <Button
                          size={"sm"}
                          variant={"outline"}
                          onClick={() => handleTaskDelete(taskToView.id)}
                        >
                          <Text> Delete Task</Text>
                        </Button>
                      </Flex>
                    </>
                  </Flex>
                  <Flex ml={"6"} fontSize={"12px"}>
                    <Text as={"i"} mr={2}>
                      Status:
                    </Text>
                    <Text
                      as={"b"}
                      color={
                        taskToView.status === "Delayed"
                          ? "#FF4141"
                          : taskToView.status === "At Risk"
                          ? "#FFA841"
                          : taskToView.status === "In Progress"
                          ? "#5F55EE"
                          : taskToView.status === "Completed"
                          ? "#26d995"
                          : "brand2.dark"
                      }
                    >
                      {taskToView.status}
                    </Text>
                  </Flex>
                </>
              )}
            </div>
            <Tabs
              defaultValue="details"
              className="flex flex-col h-full overflow-scroll p-2  "
            >
              <TabsList className="grid grid-cols-3 w-96 ">
                <TabsTrigger value="details">Task Details</TabsTrigger>
                <TabsTrigger value="history">Task History</TabsTrigger>
                <TabsTrigger value="impact">Delay Impact</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="flex-1 overflow-scroll">
                {detailsView()}
              </TabsContent>
              <TabsContent value="history" className="flex-1 overflow-scroll">
                {historyView()}
              </TabsContent>
              <TabsContent value="impact" className="flex-1 overflow-scroll">
                {impactView()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}

export default ActivitiesDetailPage;
