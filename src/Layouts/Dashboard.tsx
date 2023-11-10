import { Box, Flex } from "@chakra-ui/react";
import SidePanel from "@/Layouts/SidePanel";
import { useStore } from "@/utils/store";
import AgentInterface from "./AgentInterface";
import SearchInterface from "./SearchInterface";
import ScheduleInterface from "./ScheduleInterface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Dashboard() {
  const appView = useStore((state) => state.appView);

  return (
    <QueryClientProvider client={queryClient}>
      <Box h={{ base: "98vh", md: "100vh" }} bg={"brand.dark"}>
        <Flex height="100vh" flexDirection={{ base: "column", md: "row" }}>
          <Flex zIndex="10">
            <SidePanel />
          </Flex>
          {appView === "agent" && <AgentInterface />}
          {appView === "schedule" && <ScheduleInterface />}
          {appView === "search" && <SearchInterface />}
        </Flex>
      </Box>
    </QueryClientProvider>
  );
}
