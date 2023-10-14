import { Flex, Box } from "@chakra-ui/react";
import FileHandler from "@/Layouts/FileHandler";
import Integrationhandler from "@/Layouts/IntegrationHandler";
import AssistantPane from "@/Layouts/AssistantPane";
import MemoryPane from "@/Layouts/MemoryPane";
import { useStore } from "@/utils/store";

function SidePanelExtension() {
  const { sidePanelExtensionView } = useStore((state) => ({
    sidePanelExtensionView: state.sidePanelExtensionView,
  }));

  return (
    <Flex
      width={
        !sidePanelExtensionView || sidePanelExtensionView === "agent" ? 0 : 96
      }
      visibility={!sidePanelExtensionView ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      shadow="base"
    >
      {sidePanelExtensionView === "fileSystem" && <FileHandler />}
      {sidePanelExtensionView === "assistant" && <AssistantPane />}
    </Flex>
  );
}

export default SidePanelExtension;
