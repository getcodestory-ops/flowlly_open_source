import { Box, Flex } from "@chakra-ui/react";
import PdfLoader from "@/components/PdfLoader";
import SidePanel from "@/Layouts/SidePanel";
import SearchInterface from "@/components/SearchInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import { useStore } from "@/utils/store";
import AgentInterface from "./AgentInterface";

export default function Dashboard() {
  const pdfViewer = useStore((state) => state.pdfViewer);
  const appView = useStore((state) => state.sidePanelExtensionView);
  const { isPdfVisible } = pdfViewer;

  return (
    <Box h={{ base: "98vh", md: "100vh" }} bg={"brand.dark"}>
      <Flex height="100vh" flexDirection={{ base: "column", md: "row" }}>
        <Flex zIndex="10">
          <SidePanel />
        </Flex>
        {appView === "agent" && <AgentInterface />}
        {appView !== "agent" && (
          <>
            {!isPdfVisible && <SearchInterface />}
            {isPdfVisible && (
              <DraggablePaneDivider
                LeftPanel={SearchInterface}
                RightPanel={PdfLoader}
              />
            )}
          </>
        )}
      </Flex>
    </Box>
  );
}
