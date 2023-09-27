import { Flex, Box } from "@chakra-ui/react";
import FileHandler from "@/Layouts/FileHandler";
import Integrationhandler from "@/Layouts/IntegrationHandler";
import AssistantPane from "@/Layouts/AssistantPane";
import MemoryPane from "@/Layouts/MemoryPane";
import { useStore } from "@/utils/store";

interface SidePanel {
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
}

function SidePanelExtension({ folderList, setFolderList }: SidePanel) {
  const { sidePanelExtensionView, sessionToken, hasAdminRights } = useStore(
    (state) => ({
      sidePanelExtensionView: state.sidePanelExtensionView,
      sessionToken: state.session,
      hasAdminRights: state.hasAdminRights,
    })
  );

  return (
    <Flex
      width={!sidePanelExtensionView ? 0 : 96}
      visibility={!sidePanelExtensionView ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      shadow="base"
    >
      <Flex
        w="full"
        display={sidePanelExtensionView === "fileSystem" ? "visible" : "none"}
        direction="column"
        alignItems="center"
      >
        <FileHandler folderList={folderList} setFolderList={setFolderList} />
      </Flex>
      {sidePanelExtensionView === "assistant" && (
        <AssistantPane sessionToken={sessionToken!} />
      )}
      {sidePanelExtensionView === "integrations" && (
        <Integrationhandler sessionToken={sessionToken!} />
      )}
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
            onConversationClick={() => {}}
          />
        </Flex>
      )}
    </Flex>
  );
}

export default SidePanelExtension;
