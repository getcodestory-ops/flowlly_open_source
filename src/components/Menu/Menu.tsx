import React, { useState, useEffect } from "react";
import { Flex, Button, Link, Icon, Tooltip } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { useRouter } from "next/router";
import { FaTasks } from "react-icons/fa";
import { CgNotes } from "react-icons/cg";
import { TbReportAnalytics } from "react-icons/tb";
import { GoDependabot } from "react-icons/go";
import { BsStars } from "react-icons/bs";
import { FaFolderOpen } from "react-icons/fa";
import { LuContact2 } from "react-icons/lu";
import { GrConnect } from "react-icons/gr";
import UserPanel from "../UserPanel";

function NEW_Menu() {
  const { setAppView, appView } = useStore((state) => ({
    setAppView: state.setAppView,
    appView: state.appView,
  }));
  const [settingsView, setSettingsView] = useState<string>("folders");

  const router = useRouter();
  const { projectId } = router.query;

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
  }, [router.pathname, setAppView]);

  return (
    <Flex px={"2"}>
      <Flex
        justifyContent={"space-between"}
        alignContent={"start"}
        alignItems={"start"}
        // px={"4"}
        flexDirection="column"
        // bg={"white"}
        py={"1"}
        rounded={"lg"}
        fontWeight={"semibold"}
        fontSize={"14px"}
        gap="8"
        // className="custom-shadow"
      >
        <Tooltip label="Daily Reports" aria-label="Daily">
          <Button
            mx={"2"}
            size={"sm"}
            bg={appView === "updates" ? "brand.accent" : ""}
            onClick={() => {
              setAppView("updates");
            }}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon as={BsStars}></Icon>
          </Button>
        </Tooltip>
        <Tooltip label="Look Ahead" aria-label="Look Ahead">
          <Button
            mx={"2"}
            size={"sm"}
            bg={appView === "schedule" ? "brand.accent" : ""}
            onClick={() => {
              setAppView("schedule");
            }}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon as={FaTasks}></Icon>
          </Button>
        </Tooltip>

        {/* <Button
          mx={"2"}
          size={"sm"}
          bg={appView === "notes" ? "brand.accent" : "white"}
          onClick={() => {
            setAppView("notes");
          }}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          <Icon as={CgNotes} mr={"2"}></Icon>
          Notes
        </Button> */}
        {/* <Button
          mx={"2"}
          size={"sm"}
          bg={appView === "folders" ? "brand.accent" : "white"}
          onClick={() => {
            setAppView("folders");
          }}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          <Icon as={FaFolderOpen} mr={"2"}></Icon>
          Documents
        </Button> */}
        <Tooltip label="Project Members" aria-label="Members">
          <Button
            mx={"2"}
            size={"sm"}
            bg={appView === "members" ? "brand.accent" : ""}
            onClick={() => {
              setAppView("members");
            }}
            _hover={{ bg: "brand.dark", color: "white" }}
          >
            <Icon as={LuContact2}></Icon>
          </Button>
        </Tooltip>

        {/* <Button
          mx={"2"}
          size={"sm"}
          bg={appView === "integrations" ? "brand.accent" : "white"}
          onClick={() => {
            setAppView("integrations");
          }}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          <Icon as={GrConnect} mr={"2"}></Icon>
          Integration
        </Button> */}

        {/* <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("scenarios");
        }}
      >
        Scenarios
      </Button> */}
      </Flex>
    </Flex>
  );
}

export default NEW_Menu;
