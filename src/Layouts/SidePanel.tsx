import SidePanelExtension from "@/Layouts/SidePanelExtension";
import { Flex } from "@chakra-ui/react";
import { Session } from "@supabase/supabase-js";
import SwitchPanel from "@/Layouts/SwitchPanel";

interface SidePanel {
  sidePanelType: "fileSystem" | "integrations" | "memory" | "assistant" | null;
  sessionToken: Session;
  folderList: { name: string }[] | null;
  setFolderList: React.Dispatch<
    React.SetStateAction<{ name: string }[] | null>
  >;
  hasAdminRights: boolean;
}

export default function SidePanel() {
  return (
    <Flex>
      <SwitchPanel />
      <SidePanelExtension />
    </Flex>
  );
}
