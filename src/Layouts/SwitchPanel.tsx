import { Flex, Stack, Button, Box, Image, Tooltip } from "@chakra-ui/react";
import { BiBrain, BiFolder } from "react-icons/bi";
import UserPanel from "@/components/UserPanel";
import { useStore } from "@/utils/store";
import { AiOutlineSchedule, AiOutlineDashboard } from "react-icons/ai";
import { GoProjectRoadmap } from "react-icons/go";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useEffect } from "react";

export default function SwitchPanel() {
  const router = useRouter();
  const { projectId } = router.query;

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

  useEffect(() => {
    if (router.pathname === "/dashboard") {
      setAppView("dashboard");
    }
    if (router.pathname === "/brain") {
      setAppView("search");
    }
    if (router.pathname === "/schedule") {
      setAppView("schedule");
    }
    if (router.pathname === "/meeting") {
      setAppView("meeting");
    }
    if (router.pathname === "/documents") {
      setAppView("documentEditor");
    }
    if (router.pathname === "/projects") {
      setAppView("projectSettings");
    }
  }, [router.pathname]);

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
        <Link
          href={{ pathname: "/dashboard", query: { projectId: projectId } }}
        >
          <Tooltip
            label="Dashboard"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              bg={`${appView === "dashboard" ? "brand.accent" : ""}`}
              color="brand.dark"
              onClick={() => {
                setAppView("dashboard");
              }}
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <AiOutlineDashboard />
            </Button>
          </Tooltip>
        </Link>
        <Link href={{ pathname: "/brain", query: { projectId: projectId } }}>
          <Tooltip
            label="Search Assistant"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
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
        </Link>
        <Link href={{ pathname: "/schedule", query: { projectId: projectId } }}>
          <Tooltip
            label="Schedule Assistant"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
                setAppView("schedule");
              }}
              bg={`${appView !== "schedule" ? "" : "brand.accent"}`}
              color="brand.dark"
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <AiOutlineSchedule />
            </Button>
          </Tooltip>
        </Link>
        <Link href={{ pathname: "/meeting", query: { projectId: projectId } }}>
          <Tooltip
            label="Meeting Assistant"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
                setAppView("meeting");
              }}
              bg={`${appView !== "meeting" ? "" : "brand.accent"}`}
              color="brand.dark"
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <HiOutlineUserGroup />
            </Button>
          </Tooltip>
        </Link>
        <Link
          href={{ pathname: "/documents", query: { projectId: projectId } }}
        >
          <Tooltip
            label="Document Editor"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
                setAppView("documentEditor");
              }}
              bg={`${appView !== "documentEditor" ? "" : "brand.accent"}`}
              color="brand.dark"
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <IoDocumentTextOutline />
            </Button>
          </Tooltip>
        </Link>
        <Link
          href={{ pathname: "/communication", query: { projectId: projectId } }}
        >
          <Tooltip
            label="Communication Assistant"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
                setAppView("communication");
              }}
              bg={`${appView !== "communication" ? "" : "brand.accent"}`}
              color="brand.dark"
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <HiOutlineSpeakerphone />
            </Button>
          </Tooltip>
        </Link>
      </Stack>

      <Stack as="nav" direction={{ md: "column", sm: "row" }} spacing={4}>
        <Link href={{ pathname: "/projects", query: { projectId: projectId } }}>
          <Tooltip
            label="Project Setup"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              zIndex="1"
              onClick={() => {
                setAppView("projectSettings");
              }}
              bg={`${appView === "projectSettings" ? "brand.accent" : ""}`}
              color="brand.dark"
              _hover={{ bg: "brand.mid", color: "white" }}
            >
              <GoProjectRoadmap />
            </Button>
          </Tooltip>
        </Link>
        <UserPanel />
      </Stack>
    </Flex>
  );
}
