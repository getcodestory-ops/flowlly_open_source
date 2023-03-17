import { Flex, Box } from "@chakra-ui/react";
import FileHandler from "./FileHandler";
import Integrationhandler from "./IntegrationHandler";
import { Session } from "@supabase/supabase-js";

interface SidePanel {
  sidePanelType: "fileSystem" | "integrations" | "memory" | null;
  sessionToken: Session;
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
}

function SidePanel({
  sidePanelType,
  sessionToken,
  folderList,
  setFolderList,
}: SidePanel) {
  return (
    <Flex
      width={!sidePanelType ? 0 : 96}
      visibility={!sidePanelType ? "hidden" : "visible"}
      bg="blackAlpha.100"
      direction="column"
      alignItems="center"
      justifyContent="space-between"
      py="6"
      px=""
      shadow="base"
    >
      {sidePanelType === "fileSystem" && (
        <FileHandler
          sessionToken={sessionToken}
          folderList={folderList}
          setFolderList={setFolderList}
        />
      )}
      {sidePanelType === "integrations" && (
        <Integrationhandler sessionToken={sessionToken} />
      )}
    </Flex>
  );
}

export default SidePanel;
