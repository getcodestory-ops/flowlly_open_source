import React, { useState } from "react";
import { Flex, Text, Icon, Tooltip } from "@chakra-ui/react";
// import { AiOutlineExpandAlt } from "react-icons/ai";

// import { PiControl } from "react-icons/pi";

import { useStore } from "@/utils/store";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/api/update_routes";
import { Notification } from "@/types/notification";
import { FaRegDotCircle } from "react-icons/fa";

import ScheduleEditThroughNofitication from "./ScheduleEditThroughNofitication";

function ScheduleNotifications() {
  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["projectNotification", activeProject, session],
    queryFn: () => {
      if (!session || !activeProject)
        return Promise.reject("no session or project");
      return getNotifications(session, activeProject.project_id);
    },
    enabled: !!session,
  });

  return (
    <Flex
      flexDir={"column"}
      px="8"
      py="2"
      pb="8"
      gap="2"
      borderRadius={"lg"}
      h="78vh"
      bg="brand.light"
      overflowY="auto"
    >
      <ScheduleEditThroughNofitication
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notification={activeNotification}
      />
      <Text fontWeight={"bold"}>Action Items</Text>
      {notifications?.map((notification: Notification) => (
        <Flex key={notification.id} gap="4">
          <Flex
            gap="4"
            p="2"
            alignItems={"center"}
            borderRadius={"lg"}
            cursor="pointer"
            onClick={() => {
              setActiveNotification(notification);
              setIsOpen(true);
            }}
          >
            <Icon as={FaRegDotCircle} fontSize={"sm"} color="green.400" />
            <Tooltip label="click to expand" aria-label="Edit">
              <Text fontSize={"sm"} _hover={{ color: "blue.400" }}>
                {notification.message}
              </Text>
            </Tooltip>
            {/* <Icon
              as={AiOutlineExpandAlt}
              aria-label="Notifications"
              size="xs"
              onClick={() => {
                setActiveNotification(notification);
                setIsOpen(true);
              }}
            /> */}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

export default ScheduleNotifications;
