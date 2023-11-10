import { Flex } from "@chakra-ui/react";
import FileHandler from "@/Layouts/FileHandler";
import SearchMemory from "@/Layouts/SearchMemory";
import AgentMemoryPane from "@/components/Agent/MemoryPane";
import { useStore } from "@/utils/store";
import ScheduleProjectPanel from "@/components/Schedule/ScheduleProjectPane";

function SidePanelExtension() {
  const { sidePanelExtensionView } = useStore((state) => ({
    sidePanelExtensionView: state.sidePanelExtensionView,
  }));

  return (
    <Flex
      width={sidePanelExtensionView ? 96 : 0}
      visibility={!sidePanelExtensionView ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      shadow="base"
    >
      {sidePanelExtensionView === "fileExplorer" && <FileHandler />}
      {sidePanelExtensionView === "memory" && <SearchMemory />}
      {sidePanelExtensionView === "schedule" && <ScheduleProjectPanel />}
      {sidePanelExtensionView === "agent" && <AgentMemoryPane />}
    </Flex>
  );
}

export default SidePanelExtension;
