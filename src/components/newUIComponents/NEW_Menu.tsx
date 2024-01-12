import React, { use, useEffect } from "react";
import { Flex, Button, Link } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { useRouter } from "next/router";

function NEW_Menu() {
  const { setAppView, appView } = useStore((state) => ({
    setAppView: state.setAppView,
    appView: state.appView,
  }));

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
  }, [router.pathname]);

  useEffect(() => {
    console.log("appView", appView);
  }, [appView]);

  return (
    <Flex
      justifyContent={"space-between"}
      px={"4"}
      bg={"white"}
      py={"1"}
      w={"70%"}
      rounded={"lg"}
      fontWeight={"semibold"}
      fontSize={"14px"}
      className="custom-shadow"
    >
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("dashboard");
        }}
      >
        Dashboard
      </Button>
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("schedule");
        }}
      >
        Timeline
      </Button>
      {/* <Flex>Budget</Flex> */}
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("risks");
        }}
      >
        Risks
      </Button>
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("updates");
        }}
      >
        Updates
      </Button>
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("reports");
        }}
      >
        Reports
      </Button>
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("notes");
        }}
      >
        Notes
      </Button>
      <Button
        size={"sm"}
        bg={"white"}
        onClick={() => {
          setAppView("scenarios");
        }}
      >
        Scenarios
      </Button>
    </Flex>
  );
}

export default NEW_Menu;
