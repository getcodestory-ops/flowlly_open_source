import { Flex } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import AgentInterface from "./AgentInterface";
import SearchInterface from "./SearchInterface";
import ScheduleInterface from "./ScheduleInterface";
import MeetingInterface from "./MeetingInterface";
import BudgetInterface from "./BudgetInterface";
import CommunicationInterface from "./CommunicationInterface";
import SafetyInterface from "./SafetyInterface";
import ProjectDashboard from "./ProjectDashboard";
import ProjectSetup from "./ProjectSetup";

export default function Dashboard() {
  const appView = useStore((state) => state.appView);

  return (
    <Flex h={{ base: "90vh", md: "95vh" }}>
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
  );
}
