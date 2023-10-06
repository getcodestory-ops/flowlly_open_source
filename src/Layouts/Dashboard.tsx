import { Box, Flex } from "@chakra-ui/react";
import PdfLoader from "@/components/PdfLoader";
import SidePanel from "@/Layouts/SidePanel";
import SearchInterface from "@/components/SearchInterface";

export default function Dashboard() {
  return (
    <Box h={{ base: "98vh", md: "100vh" }} bg={"brand.dark"}>
      <Flex height="100vh" flexDirection={{ base: "column", md: "row" }}>
        <Flex zIndex="10">
          <SidePanel />
        </Flex>
        <SearchInterface />
        <Flex>
          <PdfLoader />
        </Flex>
      </Flex>
    </Box>
  );
}
