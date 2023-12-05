import { Box, Flex } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";
import { useStore } from "@/utils/store";
import AgentInterface from "./AgentInterface";
import SearchInterface from "./SearchInterface";
import ScheduleInterface from "./ScheduleInterface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MeetingInterface from "./MeetingInterface";
import BudgetInterface from "./BudgetInterface";
import CommunicationInterface from "./CommunicationInterface";
import SafetyInterface from "./SafetyInterface";
import ProjectDashboard from "./ProjectDashboard";
import ProjectSetup from "./ProjectSetup";

const queryClient = new QueryClient();

export default function Dashboard() {
  const appView = useStore((state) => state.appView);

  return (
    <QueryClientProvider client={queryClient}>
      <Flex height="100vh">
        <Flex zIndex="10">
          <SidePanel />
        </Flex>
        <Flex height={"full"} overflow={"scroll"} w="full">
          {appView === "agent" && <AgentInterface />}
          {appView === "schedule" && <ScheduleInterface />}
          {appView === "search" && <SearchInterface />}
          {appView === "meeting" && <MeetingInterface />}
          {appView === "budget" && <BudgetInterface />}
          {appView === "communication" && <CommunicationInterface />}
          {appView === "safety" && <SafetyInterface />}
          {appView === "dashboard" && <ProjectDashboard />}
          {appView === "projectSettings" && <ProjectSetup />}
        </Flex>
      </Flex>
    </QueryClientProvider>
  );
}
