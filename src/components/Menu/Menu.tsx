import React, { useState, useEffect } from "react";
import { Flex, Button, Icon, Tooltip, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { TbReportAnalytics } from "react-icons/tb";
import { FaRegBuilding } from "react-icons/fa";
import { LuContact2 } from "react-icons/lu";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { AiOutlineCalendar } from "react-icons/ai";
import { BiPlug } from "react-icons/bi";
import UpdateDailyUpdateScheduleModal from "../Schedule/ConfigureTaskQueue/ConfigureDailyUpdateModal";
import { MdOutlineSchedule } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import MenuButton, { MenuButtonProps } from "./MenuButton";

function MenuDrawer({ hovered }: { hovered?: boolean }) {
  const { setAppView, appView } = useStore((state) => ({
    setAppView: state.setAppView,
    appView: state.appView,
  }));

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onClose = () => setIsOpen(false);

  const MenuItems: MenuButtonProps[] = [
    {
      label: "Projects",
      icon: FaRegBuilding,
      fnKey: "project",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Dashboard",
      icon: VscGraph,
      fnKey: "dashboard",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Schedule",
      icon: AiOutlineCalendar,
      fnKey: "schedule",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Agent",
      icon: IoChatboxEllipsesOutline,
      fnKey: "agent",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Documents",
      icon: TbReportAnalytics,
      fnKey: "updates",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Members",
      icon: LuContact2,
      fnKey: "members",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
    {
      label: "Integration",
      icon: BiPlug,
      fnKey: "integrations",
      onClickFn: setAppView,
      expanded: hovered,
      activeKey: appView,
    },
  ];

  useEffect(() => {
    if (appView === "projectSettings") {
      setIsOpen(true);
    }
  }, [appView]);

  return (
    <Flex
      justifyContent={"space-between"}
      alignContent={"start"}
      alignItems={"start"}
      flexDirection="column"
      py={"1"}
      rounded={"lg"}
      fontWeight={"semibold"}
      fontSize={"14px"}
      gap="8"
    >
      {isOpen && (
        <UpdateDailyUpdateScheduleModal isOpen={isOpen} onClose={onClose} />
      )}

      {MenuItems.map((item) => (
        <MenuButton
          key={item.label}
          label={item.label}
          icon={item.icon}
          fnKey={item.fnKey}
          onClickFn={item.onClickFn}
          expanded={item.expanded}
          activeKey={item.activeKey}
        />
      ))}

      {!hovered ? (
        <Flex flexDir="column" gap="8">
          <Tooltip
            label="Configure Daily Update Schedule"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              mx={"2"}
              size={"sm"}
              bg={"none"}
              rounded={"md"}
              _hover={{ bg: "brand.gray", color: "brand.dark" }}
              cursor={"pointer"}
              onClick={() => setIsOpen(true)}
            >
              <Icon
                as={MdOutlineSchedule}
                boxSize={"4"}
                _hover={{
                  transform: "rotate(360deg)",
                  transition: "transform 0.5s ease-in-out",
                }}
              />
            </Button>
          </Tooltip>
        </Flex>
      ) : (
        <Flex flexDir="column" gap="8">
          <Button
            mx={"2"}
            size={"sm"}
            bg={"none"}
            rounded={"md"}
            _hover={{ bg: "brand.gray", color: "brand.dark" }}
            cursor={"pointer"}
            onClick={() => setIsOpen(true)}
          >
            <Icon
              as={MdOutlineSchedule}
              boxSize={"4"}
              _hover={{
                transform: "rotate(360deg)",
                transition: "transform 0.5s ease-in-out",
              }}
            />
            <Text fontSize={"12px"} ml={"2"} fontWeight={"medium"}>
              Configuration
            </Text>
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default MenuDrawer;
