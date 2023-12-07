import { Flex, Stack, Button, Box, Image, Tooltip } from "@chakra-ui/react";
import { FaTimes, FaSearch, FaPlug, FaBrain, FaFolder } from "react-icons/fa";
import { BiBrain, BiFolder } from "react-icons/bi";
import UserPanel from "@/components/UserPanel";
import { useStore } from "@/utils/store";
import {
  AiFillSchedule,
  AiOutlineSchedule,
  AiOutlineDashboard,
} from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";
import { GrGroup } from "react-icons/gr";
import { MdOutlineArrowRight, MdOutlineHealthAndSafety } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

export default function SwitchPanel() {
  const router = useRouter();
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
      bg="brand2.mid"
      direction={{ sm: "row", md: "column" }}
      h="full"
      alignItems="center"
      justifyContent="space-between"
      p="6"
      w="full"
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
          label="Dashboard"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("project");
              router.push("/dashboard");
              setAppView("dashboard");
            }}
            bg={`${appView === "dashboard" ? "brand.accent" : ""}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <AiOutlineDashboard />
          </Button>
        </Tooltip>
        <Tooltip
          label="Search Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("memory");
              router.push("/brain");
              setAppView("search");
            }}
            bg={`${appView === "search" ? "brand.accent" : ""}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            {" "}
            <BiBrain />
          </Button>
        </Tooltip>

        <Tooltip
          label="Schedule Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("schedule");
              router.push("/schedule");
              setAppView("schedule");
            }}
            bg={`${appView !== "schedule" ? "" : "brand.accent"}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <AiOutlineSchedule />
          </Button>
        </Tooltip>

        <Tooltip
          label="Meeting Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("schedule");
              router.push("/meeting");
              setAppView("meeting");
            }}
            bg={`${appView !== "meeting" ? "" : "brand.accent"}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <HiOutlineUserGroup />
          </Button>
        </Tooltip>
        <Tooltip
          label="Communication Assistant"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("schedule");
              setAppView("communication");
            }}
            bg={`${appView !== "communication" ? "" : "brand.accent"}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <HiOutlineSpeakerphone />
          </Button>
        </Tooltip>
      </Stack>

      <Stack as="nav" direction={{ md: "column", sm: "row" }} spacing={4}>
        <Tooltip
          label="Project Setup"
          aria-label="A tooltip"
          bg="white"
          color="brand.dark"
        >
          <Button
            zIndex="1"
            onClick={() => {
              // setSidePanelExtensionView("project");
              router.push("/projects");
              setAppView("projectSettings");
            }}
            bg={`${appView === "projectSettings" ? "brand.accent" : ""}`}
            color="brand.dark"
            _hover={{ bg: "brand.mid", color: "white" }}
          >
            <GoProjectRoadmap />
          </Button>
        </Tooltip>
        <UserPanel />
      </Stack>
    </Flex>
  );
}
