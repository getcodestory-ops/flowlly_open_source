import { Flex, Stack, Button, Box } from "@chakra-ui/react";
import { FaTimes, FaSearch, FaPlug, FaBrain, FaFolder } from "react-icons/fa";
import { SiFoursquarecityguide } from "react-icons/si";
import UserPanel from "@/components/UserPanel";
import { useStore } from "@/utils/store";

export default function SwitchPanel() {
  const { sidePanelExtensionView, setSidePanelExtensionView } = useStore(
    (state) => ({
      sidePanelExtensionView: state.sidePanelExtensionView,
      setSidePanelExtensionView: state.setSidePanelExtensionView,
    })
  );

  return (
    <Flex
      // width="16"
      bg="brand.dark"
      direction={{ sm: "row", md: "column" }}
      alignItems="center"
      justifyContent="space-between"
      // shadow="base"
      p="6"
      // display={{ base: showMenu ? "flex" : "none", md: "flex" }}
    >
      <Stack direction={{ md: "column", sm: "row" }} spacing={4}>
        <Button
          // transform="translateY(-50%)"
          zIndex="1"
          onClick={() => setSidePanelExtensionView("assistant")}
          bg="brand.dark"
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {sidePanelExtensionView !== "assistant" ? <FaBrain /> : <FaTimes />}
        </Button>
        <Button
          // transform="translateY(-50%)"
          zIndex="1"
          onClick={() => setSidePanelExtensionView("fileSystem")}
          bg="brand.dark"
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {sidePanelExtensionView !== "fileSystem" ? <FaFolder /> : <FaTimes />}
        </Button>
        {/* <Button
          // transform="translateY(-50%)"
          zIndex="1"
          onClick={() => setSidePanelExtensionView("integrations")}
          bg="brand.dark"
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {sidePanelExtensionView !== "integrations" ? <FaPlug /> : <FaTimes />}
        </Button>
        <Button
          // transform="translateY(-50%)"
          zIndex="1"
          onClick={() => setSidePanelExtensionView("memory")}
          bg="brand.dark"
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {sidePanelExtensionView !== "memory" ? <FaBrain /> : <FaTimes />}
        </Button> */}
      </Stack>

      <Box as="nav">
        <UserPanel />
      </Box>
    </Flex>
  );
}
