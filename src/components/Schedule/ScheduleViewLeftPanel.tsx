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
import { LuGanttChartSquare } from "react-icons/lu";
import { IoChevronDownOutline } from "react-icons/io5";
import ScheduleGanttInterface from "./ScheduleGanttInterface";
import CustomDatePicker from "../DatePicker/DatePicker";
import ProbabilitySelector from "../ProbabilitySelector";
import CreateContingency from "./CreateContingency/CreateContingency";
import ProcessHistoryButton from "./ProcessHistory/ProcessHistoryButton";

function ScheduleUiView() {
  const { session, activeChatEntity, setActiveChatEntity, activeProject } =
    useStore((state) => ({
      session: state.session,
      activeChatEntity: state.activeChatEntity,
      setActiveChatEntity: state.setActiveChatEntity,
      activeProject: state.activeProject,
    }));
  const [view, setView] = useState<string>("insights");
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
    <Flex
      display="flex"
      direction="column"
      alignContent="space-between"
      mt={"4"}
    >
      <AddNewChatEntity isOpen={isOpen} onClose={onClose} />
      <Flex>
        <Flex
          display="flex"
          justify="flex-start"
          marginTop="1"
          borderRight={"2px"}
          borderColor={"brand2.mid"}
        >
          <Tooltip
            label="Schedule Insights"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              size={"sm"}
              marginLeft="8"
              marginRight="5"
              bg={`${view === "insights" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("insights")}
            >
              <Icon as={CgInsights} />
            </Button>
          </Tooltip>
          <Tooltip
            label="Gantt Chart"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              size={"sm"}
              marginRight="5"
              bg={`${view === "gantt" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("gantt")}
            >
              <Icon as={LuGanttChartSquare} />
            </Button>
          </Tooltip>
          <Tooltip
            label="Schedule Assistant"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              size={"sm"}
              bg={`${view === "assistant" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("assistant")}
              marginRight="5"
            >
              <Icon as={PiRobot} />
            </Button>
          </Tooltip>
          <Tooltip
            label="Reports"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              size={"sm"}
              bg={`${view === "reports" ? "brand2.accent" : "brand2.mid"}`}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setView("reports")}
              mr="5"
            >
              <Icon as={TbReportAnalytics} />
            </Button>
          </Tooltip>
        </Flex>
        <Flex pl={"5"} pr={"2"} borderRight={"2px"} borderColor={"brand2.mid"}>
          <CustomDatePicker />
          <Flex>
            <ProbabilitySelector />
          </Flex>
        </Flex>
        <Flex pl={"5"} alignItems={"center"}>
          <ProcessHistoryButton />
          <Flex ml={"5"}>
            <CreateContingency />
          </Flex>
        </Flex>
      </Flex>
      <Flex>
        {view === "assistant" && (
          <Flex alignItems={"center"} mt={"4"} ml={"10"}>
            <Text mr={"2"} fontSize={"sm"} fontWeight={"semibold"}>
              Chat:
            </Text>
            <Menu>
              <MenuButton
                onClick={onConversation}
                as={Button}
                rightIcon={<IoChevronDownOutline />}
                size={"xs"}
                bg={"brand2.mid"}
                _hover={{ bg: "brand2.dark", color: "white" }}
              >
                {activeChatEntity ? activeChatEntity.chat_name : "No Chat"}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onOpen}>+ Create New Chat</MenuItem>
                <MenuDivider borderColor={"gray.400"} />
                {chatEntitities &&
                  chatEntitities.map((chatEntity) => (
                    <MenuItem
                      key={chatEntity.id}
                      as={"b"}
                      onClick={() => setActiveChatEntity(chatEntity)}
                    >
                      {chatEntity.chat_name}
                    </MenuItem>
                  ))}
              </MenuList>
            </Menu>
          </Flex>
        )}
      </Flex>
      <Flex className="ScheduleView" h={"full"}>
        {view === "assistant" && activeChatEntity.chat_name.length !== 0 ? (
          <ScheduleChatInterface />
        ) : view === "assistant" && activeChatEntity.chat_name.length === 0 ? (
          <>
            <Flex
              w={"full"}
              justifyContent={"center"}
              alignItems={"center"}
              fontSize={"2xl"}
              fontWeight={"black"}
            >
              Select or Create Chat at the top
            </Flex>
          </>
        ) : (
          ""
        )}

        {view === "insights" && (
          <DraggablePaneDivider
            LeftPanel={ScheduleInsights}
            RightPanel={RightPanel}
          />
        )}
        {view === "reports" && <ReportsPage />}
        {view === "gantt" && <ScheduleGanttInterface />}
      </Flex>
    </Flex>
  );
}

export default ScheduleUiView;
