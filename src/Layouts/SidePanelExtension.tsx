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
      width={!sidePanelExtensionView ? 0 : 96}
      visibility={!sidePanelExtensionView ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      shadow="base"
    >
      {/* <Flex
        w="full"
        display={sidePanelExtensionView === "fileSystem" ? "visible" : "none"}
        direction="column"
        alignItems="center"
      > */}
      {sidePanelExtensionView === "fileSystem" && <FileHandler />}
      {/* </Flex> */}
      {sidePanelExtensionView === "assistant" && <AssistantPane />}
      {/* {sidePanelExtensionView === "integrations" && <Integrationhandler />}
      {sidePanelExtensionView === "memory" && (
        <Flex width="full" height="100vh">
          <MemoryPane
            conversations={[
              {
                id: 1,
                title: "Current Conversation",
                message: [{ id: 1, message: "hello", fromUser: false }],
              },
            ]}
            onNewChatClick={() => console.log("new chat click")}
            onConversationClick={() => {
              console.log("this");
            }}
          />
        </Flex>
      )} */}
    </Flex>
  );
}

export default SidePanelExtension;
