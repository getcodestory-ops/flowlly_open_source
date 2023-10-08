import { Box, Flex } from "@chakra-ui/react";
import PdfLoader from "@/components/PdfLoader";
import SidePanel from "@/Layouts/SidePanel";
import SearchInterface from "@/components/SearchInterface";
import DraggablePaneDivider from "@/components/DraggablePaneDivider";
import { useStore } from "@/utils/store";

export default function Dashboard() {
  const pdfViewer = useStore((state) => state.pdfViewer);
  const { isPdfVisible } = pdfViewer;

  return (
    <Box h={{ base: "98vh", md: "100vh" }} bg={"brand.dark"}>
      <Flex height="100vh" flexDirection={{ base: "column", md: "row" }}>
        <Flex zIndex="10">
          <SidePanel />
        </Flex>
        {!isPdfVisible && <SearchInterface />}
        {isPdfVisible && (
          <DraggablePaneDivider
            LeftPanel={SearchInterface}
            RightPanel={PdfLoader}
          />
        )}

        {/* <SearchInterface /> */}
        {/* <Flex>
          <PdfLoader />
        </Flex> */}
      </Flex>
    </Box>
  );
}
