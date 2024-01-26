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
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddNewActivityModal from "./AddNewActivityModal";

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
  const [view, setView] = useState<string>("tasks");
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

  const handleAddActivity = () => {
    onOpen();
  };

  return (
    <>
      <AddNewActivityModal isOpen={isOpen} onClose={onClose} />
      <Grid
        h={"full"}
        templateRows="repeat(10, 1fr)"
        templateColumns="repeat(2, 1fr)"
        gap={4}
      >
        <GridItem rowSpan={1} colSpan={1}>
          <Flex borderColor={"brand2.mid"}>
            <Flex
              alignItems={"center"}
              mr={"4"}
              border={"1px"}
              px={"2"}
              py={"0.5"}
              rounded={"lg"}
              bg={`${view === "tasks" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              cursor={"pointer"}
              onClick={() => setView("tasks")}
            >
              <Icon as={FaTasks} />
              <Text ml={"2"} fontSize={"xs"} fontWeight={"bold"}>
                List
              </Text>
            </Flex>
            {/* <Flex alignItems={"center"} mr={"4"}>
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
                List
              </Text>
            </Flex> */}
            <Flex
              alignItems={"center"}
              mr={"4"}
              border={"1px"}
              px={"2"}
              py={"0.5"}
              rounded={"lg"}
              bg={`${view === "gantt" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              cursor={"pointer"}
              onClick={() => setView("gantt")}
            >
              <Icon as={LuGanttChart} boxSize={"5"} />

              <Text fontSize={"xs"} fontWeight={"bold"} ml={"2"}>
                Gantt
              </Text>
            </Flex>
            <Flex
              alignItems={"center"}
              mr={"4"}
              border={"1px"}
              px={"2"}
              py={"0.5"}
              rounded={"lg"}
              bg={`${view === "kanban" ? "brand2.accent" : "white"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              cursor={"pointer"}
              onClick={() => setView("kanban")}
            >
              <Icon as={PiKanban} boxSize={"5"} />

              <Text fontSize={"xs"} fontWeight={"bold"} ml={"2"}>
                Kanban
              </Text>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Flex justifyContent={"space-between"}>
            <Flex>
              <CustomDatePicker />
              <Flex ml={"4"}>
                <ProbabilitySelector />
              </Flex>
            </Flex>
            <Button
              size={"xs"}
              bg={"brand.dark"}
              color={"white"}
              onClick={handleAddActivity}
            >
              + Add Task
            </Button>
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
                  <DndProvider backend={HTML5Backend}>
                    <KanbanBoard />
                  </DndProvider>
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
                <Flex w={"full"} h={"full"}>
                  <ActivitiesDetailPage />
                </Flex>
              </GridItem>
            </Grid>
          )}
        </GridItem>
      </Grid>
    </>
  );
}

export default ScheduleUiView;
