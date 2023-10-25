import { Flex, Stack, Button, Box } from "@chakra-ui/react";
import { FaTimes, FaSearch, FaPlug, FaBrain, FaFolder } from "react-icons/fa";
import UserPanel from "@/components/UserPanel";
import { useStore } from "@/utils/store";
import { AiFillSchedule } from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";

export default function SwitchPanel() {
  const { sidePanelExtensionView, setSidePanelExtensionView, setAppView } =
    useStore((state) => ({
      sidePanelExtensionView: state.sidePanelExtensionView,
      setSidePanelExtensionView: state.setSidePanelExtensionView,
      setAppView: state.setAppView,
    }));

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
          zIndex="1"
          onClick={() => {
            setSidePanelExtensionView("memory");
            setAppView("search");
          }}
          bg={`${
            sidePanelExtensionView !== "memory" ? "brand.dark" : "brand.accent"
          }`}
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {" "}
          <FaBrain />
        </Button>
        <Button
          zIndex="1"
          onClick={() => {
            setSidePanelExtensionView("fileExplorer");
            setAppView("search");
          }}
          bg={`${
            sidePanelExtensionView !== "fileExplorer"
              ? "brand.dark"
              : "brand.accent"
          }`}
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          {" "}
          <FaFolder />
        </Button>
        <Button
          zIndex="1"
          onClick={() => {
            setSidePanelExtensionView("agent");
            setAppView("agent");
          }}
          bg={`${
            sidePanelExtensionView !== "agent" ? "brand.dark" : "brand.accent"
          }`}
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          <HiUserGroup />
        </Button>
        <Button
          zIndex="1"
          onClick={() => {
            setSidePanelExtensionView("schedule");
            setAppView("schedule");
          }}
          bg={`${
            sidePanelExtensionView !== "schedule"
              ? "brand.dark"
              : "brand.accent"
          }`}
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          <AiFillSchedule />
        </Button>
      </Stack>

      <Box as="nav">
        <UserPanel />
      </Box>
    </Flex>
  );
}
