import { Flex, Box } from "@chakra-ui/react";
import FileHandler from "./FileHandler";
import Integrationhandler from "./IntegrationHandler";
import { Session } from "@supabase/supabase-js";
import MemoryPane from "./MemoryPane";

interface SidePanel {
  sidePanelType: "fileSystem" | "integrations" | "memory" | null;
  sessionToken: Session;
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
  hasAdminRights: boolean;
}

function SidePanel({
  sidePanelType,
  sessionToken,
  folderList,
  setFolderList,
  hasAdminRights
}: SidePanel) {
  return (
    <Flex
      width={!sidePanelType ? 0 : 96}
      visibility={!sidePanelType ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      shadow="base"
    >
      <Flex
        w="full"
        display={sidePanelType === "fileSystem" ? "visible" : "none"}
        direction="column"
        alignItems="center"
      >
        <FileHandler
          sessionToken={sessionToken}
          folderList={folderList}
          setFolderList={setFolderList}
          hasAdminRights={hasAdminRights}
        />
      </Flex>
      {sidePanelType === "integrations" && (
        <Integrationhandler sessionToken={sessionToken} />
      )}
      {sidePanelType === "memory" && (
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
      )}
    </Flex>
  );
}

export default SidePanel;
