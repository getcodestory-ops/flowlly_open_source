import React, { useState, useEffect } from "react";
import { Flex, Button, Link, Icon, Tooltip, Text } from "@chakra-ui/react";
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
import { useMediaQuery } from "@chakra-ui/react";
import { FaPlug } from "react-icons/fa";

function NEW_Menu() {
  const { setAppView, appView } = useStore((state) => ({
    setAppView: state.setAppView,
    appView: state.appView,
  }));
  const [settingsView, setSettingsView] = useState<string>("folders");
  const [smallScreen] = useMediaQuery("(max-width: 1441px)");
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
        {smallScreen ? (
          <>
            <Tooltip
              label="Daily Reports"
              aria-label="Daily"
              bg="white"
              color="brand.dark"
            >
              <Button
                mx={"2"}
                size={"sm"}
                bg={appView === "updates" ? "brand.accent" : ""}
                onClick={() => {
                  setAppView("updates");
                }}
                color={"white"}
                _hover={{
                  color: "brand.dark",
                  bg: "#E5E5E5",
                }}
              >
                <Icon
                  as={TbReportAnalytics}
                  color={appView === "updates" ? "brand.dark" : ""}
                ></Icon>
              </Button>
            </Tooltip>
            <Tooltip
              label="Look Ahead"
              aria-label="Look Ahead"
              bg="white"
              color="brand.dark"
            >
              <Button
                mx={"2"}
                size={"sm"}
                bg={appView === "schedule" ? "brand.accent" : ""}
                onClick={() => {
                  setAppView("schedule");
                }}
                color={"white"}
                _hover={{
                  color: "brand.dark",
                  bg: "#E5E5E5",
                }}
              >
                <Icon
                  as={FaTasks}
                  color={appView === "schedule" ? "brand.dark" : ""}
                ></Icon>
              </Button>
            </Tooltip>
            <Tooltip
              label="Project Members"
              aria-label="Members"
              bg="white"
              color="brand.dark"
            >
              <Button
                mx={"2"}
                size={"sm"}
                bg={appView === "members" ? "brand.accent" : ""}
                onClick={() => {
                  setAppView("members");
                }}
                color={"white"}
                _hover={{
                  color: "brand.dark",
                  bg: "#E5E5E5",
                }}
              >
                <Icon
                  as={LuContact2}
                  color={appView === "members" ? "brand.dark" : ""}
                ></Icon>
              </Button>
            </Tooltip>

            <Button
              w={"90%"}
              mx={"2"}
              size={"sm"}
              bg={appView === "integrations" ? "brand.accent" : ""}
              onClick={() => {
                setAppView("integrations");
              }}
              color={"white"}
              _hover={{
                color: "brand.dark",
                bg: "#E5E5E5",
              }}
              justifyContent={"flex-start"}
            >
              <Icon
                as={FaPlug}
                color={appView === "integrations" ? "brand.dark" : "white"}
              ></Icon>
            </Button>
          </>
        ) : (
          <>
            <Button
              w={"90%"}
              mx={"2"}
              size={"sm"}
              bg={appView === "updates" ? "brand.accent" : ""}
              onClick={() => {
                setAppView("updates");
              }}
              color={"white"}
              _hover={{
                color: "brand.dark",
                bg: "#E5E5E5",
              }}
              justifyContent={"flex-start"}
            >
              <Icon
                as={TbReportAnalytics}
                color={appView === "updates" ? "brand.dark" : ""}
              ></Icon>
              <Text
                fontSize={"12px"}
                color={appView === "updates" ? "brand.dark" : "white"}
                ml={"2"}
                fontWeight={"medium"}
              >
                Daily Reports
              </Text>
            </Button>

            <Button
              w={"90%"}
              mx={"2"}
              size={"sm"}
              bg={appView === "schedule" ? "brand.accent" : ""}
              onClick={() => {
                setAppView("schedule");
              }}
              color={"white"}
              _hover={{
                color: "brand.dark",
                bg: "#E5E5E5",
              }}
              justifyContent={"flex-start"}
            >
              <Icon
                as={FaTasks}
                color={appView === "schedule" ? "brand.dark" : ""}
              ></Icon>
              <Text
                fontSize={"12px"}
                color={appView === "schedule" ? "brand.dark" : "white"}
                ml={"2"}
                fontWeight={"medium"}
              >
                Schedule
              </Text>
            </Button>

            <Button
              w={"90%"}
              mx={"2"}
              size={"sm"}
              bg={appView === "members" ? "brand.accent" : ""}
              onClick={() => {
                setAppView("members");
              }}
              color={"white"}
              _hover={{
                color: "brand.dark",
                bg: "#E5E5E5",
              }}
              justifyContent={"flex-start"}
            >
              <Icon
                as={LuContact2}
                color={appView === "members" ? "#14213D" : ""}
              ></Icon>
              <Text
                fontSize={"12px"}
                color={appView === "members" ? "brand.dark" : "white"}
                ml={"2"}
                fontWeight={"medium"}
              >
                Members
              </Text>
            </Button>
            <Button
              w={"90%"}
              mx={"2"}
              size={"sm"}
              bg={appView === "integrations" ? "brand.accent" : ""}
              onClick={() => {
                setAppView("integrations");
              }}
              color={"white"}
              _hover={{
                color: "brand.dark",
                bg: "#E5E5E5",
              }}
              justifyContent={"flex-start"}
            >
              <Icon
                as={FaPlug}
                color={appView === "integrations" ? "brand.dark" : "white"}
              ></Icon>
              <Text
                fontSize={"12px"}
                color={appView === "integrations" ? "brand.dark" : "white"}
                ml={"2"}
                fontWeight={"medium"}
              >
                Integration
              </Text>
            </Button>
          </>
        )}

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
