import React, { useState, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Icon,
  VStack,
  Text,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { CgInsights } from "react-icons/cg";
import { PiRobot } from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";
import ScheduleChatInterface from "./ScheduleChat";
import ScheduleInsights from "./ScheduleInsights";
import ReportsPage from "./ReportsPage";
import { useStore } from "@/utils/store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAgentChatEntities } from "@/api/agentRoutes";
import AddNewChatEntity from "./AddNewChatEntity";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import RightPanel from "@/components/Schedule/ScheduleViewRightPanel";
import { PiKanban } from "react-icons/pi";
import { LuGanttChart } from "react-icons/lu";
import { FaTasks } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";
import ScheduleGanttInterface from "./ScheduleGanttInterface";
import CustomDatePicker from "../DatePicker/DatePicker";
import ProbabilitySelector from "../ProbabilitySelector";
import CreateContingency from "./CreateContingency/CreateContingency";
import ProcessHistoryButton from "./ProcessHistory/ProcessHistoryButton";
import ActivitiesDetailPage from "./ActivityDetailsPage";
import DocumentList from "../DocumentEditor/DocumentList";
import KanbanBoard from "../kanban/KanbanBoard";

function ScheduleUiView({ uiView }: { uiView?: string | string[] }) {
  const {
    session,
    activeChatEntity,
    setActiveChatEntity,
    activeProject,
    userActivities,
  } = useStore((state) => ({
    session: state.session,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    activeProject: state.activeProject,
    userActivities: state.userActivities,
  }));
  const [view, setView] = useState<string>("gantt");
  const [conversationView, setConversationView] = useState(false);
  const onConversation = () => {
    setConversationView(!conversationView);
  };
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projectList", session],
    queryFn: () => getProjects(session!),
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (uiView === "assistant" || uiView === "reports" || uiView === "gantt") {
      setView(uiView);
    }
  }, [uiView]);

  const { data: chatEntitities, isLoading: chatsLoading } = useQuery({
    queryKey: ["chatEntityList", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      return getAgentChatEntities(session, activeProject.project_id);
    },
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (chatEntitities && chatEntitities.length > 0) {
      setActiveChatEntity(chatEntitities[0]);
    }
  }, [chatEntitities]);

  return (
    <Grid
      h={"full"}
      templateRows="repeat(10, 1fr)"
      templateColumns="repeat(2, 1fr)"
      gap={4}
    >
      <GridItem rowSpan={1} colSpan={1}>
        <Flex borderColor={"brand2.mid"}>
          <Flex alignItems={"center"} mr={"4"}>
            <Button
              size={"sm"}
              bg={`${view === "gantt" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("gantt")}
              p={"0.5"}
              border={"2px"}
              rounded={"lg"}
              mr={"0.5"}
            >
              <Icon as={LuGanttChart} boxSize={"5"} />
            </Button>
            <Text fontSize={"xs"} fontWeight={"bold"}>
              Gantt
            </Text>
          </Flex>
          <Flex alignItems={"center"} mr={"4"}>
            <Button
              p={"0.5"}
              size={"sm"}
              border={"2px"}
              rounded={"lg"}
              mr={"0.5"}
              bg={`${view === "kanban" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("kanban")}
            >
              <Icon as={PiKanban} boxSize={"5"} />
            </Button>
            <Text fontSize={"xs"} fontWeight={"bold"}>
              Kanban
            </Text>
          </Flex>
          <Flex alignItems={"center"} mr={"4"}>
            <Button
              p={"0.5"}
              size={"sm"}
              border={"2px"}
              rounded={"lg"}
              mr={"0.5"}
              bg={`${view === "tasks" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("tasks")}
            >
              <Icon as={FaTasks} />
            </Button>
            <Text fontSize={"xs"} fontWeight={"bold"}>
              Tasks
            </Text>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem rowSpan={1} colSpan={1}>
        <Flex>
          <CustomDatePicker />
          <Flex>
            <ProbabilitySelector />
          </Flex>
        </Flex>
      </GridItem>
      <GridItem rowSpan={9} colSpan={2}>
        {view === "gantt" && (
          <Grid h="full" templateColumns="repeat(1, 1fr)" gap={4}>
            <GridItem
              colSpan={1}
              overflow={"auto"}
              className="custom-scrollbar"
            >
              <Flex w={"full"}>
                <ScheduleGanttInterface />
              </Flex>
            </GridItem>
          </Grid>
        )}
        {userActivities && userActivities.length > 0 && view === "kanban" && (
          <Grid h="full" templateColumns="repeat(1, 1fr)" gap={4}>
            <GridItem
              colSpan={1}
              overflow={"auto"}
              className="custom-scrollbar"
            >
              <Flex w={"full"}>
                <KanbanBoard />
              </Flex>
            </GridItem>
          </Grid>
        )}

        {view === "tasks" && (
          <Grid h="full" templateColumns="repeat(3, 1fr)" gap={4}>
            <GridItem
              colSpan={1}
              overflowY={"auto"}
              className="custom-scrollbar"
            >
              <Flex w={"full"}>
                <ScheduleInsights />
              </Flex>
            </GridItem>
            <GridItem
              colSpan={2}
              overflowY={"auto"}
              className="custom-scrollbar"
            >
              <Flex w={"full"}>
                <ActivitiesDetailPage />
              </Flex>
            </GridItem>
          </Grid>
          // <Flex h="full" w="full" gap="16">
          //   <Flex flex={1}>
          //     <ScheduleInsights />
          //   </Flex>
          //   <Box width="2px" h="full" bg="gray.200"></Box>
          //   <Flex flex={1}>
          //     <ActivitiesDetailPage />
          //   </Flex>
          // </Flex>
        )}
      </GridItem>
    </Grid>
    // <Flex display="flex" direction="column">
    //   <AddNewChatEntity isOpen={isOpen} onClose={onClose} />
    //   <Flex h="5vh" alignItems={"center"}>
    //     <Flex borderColor={"brand2.mid"}>
    //       <Flex alignItems={"center"} mr={"4"}>
    //         <Button
    //           size={"sm"}
    //           bg={`${view === "gantt" ? "brand2.accent" : "white"}`}
    //           _hover={{ bg: "brand.dark", color: "white" }}
    //           onClick={() => setView("gantt")}
    //           p={"0.5"}
    //           border={"2px"}
    //           rounded={"lg"}
    //           mr={"0.5"}
    //         >
    //           <Icon as={LuGanttChart} boxSize={"5"} />
    //         </Button>
    //         <Text fontSize={"xs"} fontWeight={"bold"}>
    //           Gantt
    //         </Text>
    //       </Flex>
    //       <Flex alignItems={"center"} mr={"4"}>
    //         <Button
    //           p={"0.5"}
    //           size={"sm"}
    //           border={"2px"}
    //           rounded={"lg"}
    //           mr={"0.5"}
    //           bg={`${view === "kanban" ? "brand2.accent" : "white"}`}
    //           _hover={{ bg: "brand.dark", color: "white" }}
    //           onClick={() => setView("kanban")}
    //         >
    //           <Icon as={PiKanban} boxSize={"5"} />
    //         </Button>
    //         <Text fontSize={"xs"} fontWeight={"bold"}>
    //           Kanban
    //         </Text>
    //       </Flex>
    //       <Flex alignItems={"center"} mr={"4"}>
    //         <Button
    //           p={"0.5"}
    //           size={"sm"}
    //           border={"2px"}
    //           rounded={"lg"}
    //           mr={"0.5"}
    //           bg={`${view === "tasks" ? "brand2.accent" : "white"}`}
    //           _hover={{ bg: "brand.dark", color: "white" }}
    //           onClick={() => setView("tasks")}
    //         >
    //           <Icon as={FaTasks} />
    //         </Button>
    //         <Text fontSize={"xs"} fontWeight={"bold"}>
    //           Tasks
    //         </Text>
    //       </Flex>
    //     </Flex>
    //     <Flex pl={"5"} pr={"2"}>
    //       <CustomDatePicker />
    //       <Flex>
    //         <ProbabilitySelector />
    //       </Flex>
    //     </Flex>
    //     {/* <Flex pl={"5"} alignItems={"center"}>
    //       <ProcessHistoryButton />
    //       <Flex ml={"5"}>
    //         <CreateContingency />
    //       </Flex>
    //     </Flex> */}
    //   </Flex>
    //   <Flex h="90vh">
    //     <Flex className="ScheduleView">
    //       {/* {view === "assistant" && (
    //         <Flex
    //           mt={"4"}
    //           ml={"10"}
    //           direction="column"
    //           justifyContent={"space-between"}
    //         >
    //           <Flex>
    //             <Text mr={"2"} fontSize={"sm"} fontWeight={"semibold"}>
    //               Chat:
    //             </Text>
    //             <Menu>
    //               <MenuButton
    //                 onClick={onConversation}
    //                 as={Button}
    //                 rightIcon={<IoChevronDownOutline />}
    //                 size={"xs"}
    //                 bg={"brand2.mid"}
    //                 _hover={{ bg: "brand2.dark", color: "white" }}
    //               >
    //                 {activeChatEntity ? activeChatEntity.chat_name : "No Chat"}
    //               </MenuButton>
    //               <MenuList>
    //                 <MenuItem onClick={onOpen}>+ Create New Chat</MenuItem>
    //                 <MenuDivider borderColor={"gray.400"} />
    //                 {chatEntitities &&
    //                   chatEntitities.map((chatEntity) => (
    //                     <MenuItem
    //                       key={chatEntity.id}
    //                       as={"b"}
    //                       onClick={() => setActiveChatEntity(chatEntity)}
    //                     >
    //                       {chatEntity.chat_name}
    //                     </MenuItem>
    //                   ))}
    //               </MenuList>
    //             </Menu>
    //           </Flex>
    //           {activeChatEntity.chat_name.length !== 0 ? (
    //             <ScheduleChatInterface />
    //           ) : view === "assistant" &&
    //             activeChatEntity.chat_name.length === 0 ? (
    //             <>
    //               <Flex
    //                 w={"full"}
    //                 justifyContent={"center"}
    //                 alignItems={"center"}
    //                 fontSize={"2xl"}
    //                 fontWeight={"black"}
    //               >
    //                 Select or Create Chat at the top
    //               </Flex>
    //             </>
    //           ) : (
    //             ""
    //           )}
    //         </Flex>
    //       )} */}

    //       {view === "insights" && (
    //         <Flex h="full" w="full" gap="16">
    //           <Flex flex={1}>
    //             <ScheduleInsights />
    //           </Flex>
    //           <Box width="2px" h="full" bg="gray.200"></Box>
    //           <Flex flex={1}>
    //             <ActivitiesDetailPage />
    //           </Flex>
    //         </Flex>
    //       )}
    //       {/* {view === "reports" && <ReportsPage />} */}
    //       {view === "gantt" && <ScheduleGanttInterface />}

    //       {/* {view === "documents" && (
    //         <Flex
    //           h="full"
    //           w={{ base: "full", "2xl": "7xl" }}
    //           direction="column"
    //         >
    //           <DocumentList />
    //         </Flex>
    //       )} */}
    //     </Flex>
    //   </Flex>
    // </Flex>
  );
}

export default ScheduleUiView;
