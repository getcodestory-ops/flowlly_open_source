import { Flex, Stack, Button, Box, Image, Tooltip } from "@chakra-ui/react";
import { FaTimes, FaSearch, FaPlug, FaBrain, FaFolder } from "react-icons/fa";
import { BiBrain, BiFolder } from "react-icons/bi";
import UserPanel from "@/components/UserPanel";
import { useStore } from "@/utils/store";
import { AiFillSchedule, AiOutlineSchedule } from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";
import { GrGroup } from "react-icons/gr";
import { MdOutlineArrowRight } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";

export default function SwitchPanel() {
  const {
    sidePanelExtensionView,
    setSidePanelExtensionView,
    setAppView,
    appView,
  } = useStore((state) => ({
    sidePanelExtensionView: state.sidePanelExtensionView,
    setSidePanelExtensionView: state.setSidePanelExtensionView,
    setAppView: state.setAppView,
    appView: state.appView,
  }));

  return (
    <Flex
      // width="16"
      // bg="brand.dark"
      bg="brand2.mid"
      direction={{ sm: "row", md: "column" }}
      alignItems="center"
      justifyContent="space-between"
      // shadow="base"
      p="6"
      // display={{ base: showMenu ? "flex" : "none", md: "flex" }}
    >
      <Box display="flex" justifyContent="center">
        <Image
          src="https://qfktimnmlcnfowxuoune.supabase.co/storage/v1/object/public/logos/flowlly_identifier.svg"
          alt="logo"
          width="25px"
        />
      </Box>
      <Stack direction={{ md: "column", sm: "row" }} spacing={4}>
        <Tooltip
          label="Search Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              setSidePanelExtensionView("memory");
              setAppView("search");
            }}
            bg={`${appView === "search" ? "brand.accent" : ""}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
            fontSize="xl"
          >
            {" "}
            {/* <FaBrain /> */}
            <BiBrain />
            {/* <MdOutlineArrowRight/> */}
          </Button>
        </Tooltip>
        {/* <Button
          zIndex="1"
          onClick={() => {
            setSidePanelExtensionView("agent");
            setAppView("agent");
          }}
          bg={`${appView !== "agent" ? "brand.accent" : ""}`}
          color="white"
          _hover={{ bg: "brand.mid", color: "white" }}
        >
          <GrGroup />

        </Button> */}
        <Tooltip
          label="Schedule Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              setSidePanelExtensionView("schedule");
              setAppView("schedule");
            }}
            bg={`${appView !== "schedule" ? "" : "brand.accent"}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <AiOutlineSchedule />
            {/* <AiFillSchedule /> */}
          </Button>
        </Tooltip>
      </Stack>

      <Stack as="nav" direction={{ md: "column", sm: "row" }} spacing={4}>
        {/* <Tooltip
          label="File Upload"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              setSidePanelExtensionView("fileExplorer");
              setAppView("search");
            }}
            bg={`${
              sidePanelExtensionView !== "fileExplorer" || appView !== "search"
                ? ""
                : "brand.accent"
            }`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            {" "}
            <BiFolder />
            
          </Button>
        </Tooltip> */}
        <Tooltip
          label="Project Setup"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              setSidePanelExtensionView("project");
              setAppView("project");
            }}
            bg={`${appView === "project" ? "brand.accent" : ""}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            {" "}
            <GoProjectRoadmap />
          </Button>
        </Tooltip>
        <UserPanel />
      </Stack>
    </Flex>
  );
}
