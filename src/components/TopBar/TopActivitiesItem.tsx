import React, { useState, useEffect } from "react";
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { IoChevronDownOutline } from "react-icons/io5";
import { ActivityEntity } from "@/types/activities";

interface TopActivitiesItemProps {
  taskToView: ActivityEntity;
  setTaskToView: (project: ActivityEntity) => void;
  setRightPanelView: (view: "task" | "gantt") => void;
  activities: ActivityEntity[];
}

const TopActivitiesItems = ({
  taskToView,
  setTaskToView,
  setRightPanelView,
  activities,
}: TopActivitiesItemProps) => {
  const [activeActivity, setActiveActivity] = useState<ActivityEntity | null>(
    null
  );

  return (
    <Flex>
      <Menu>
        <MenuButton fontSize={"xl"} fontWeight={"black"}>
          <Flex alignItems={"center"}>
            {activeActivity?.name ?? ""}
            <Flex ml={"2"}>
              <IoChevronDownOutline />
            </Flex>
          </Flex>
        </MenuButton>

        <MenuList>
          {activities &&
            activities.map((activity: ActivityEntity) => (
              <Flex
                key={activity.id}
                onClick={() => {
                  setTaskToView(activity);
                  setRightPanelView("task");
                  setActiveActivity(activity);
                }}
              >
                <MenuItem>{activity.name}</MenuItem>
              </Flex>
            ))}
        </MenuList>
      </Menu>
    </Flex>
  );
};
export default TopActivitiesItems;
