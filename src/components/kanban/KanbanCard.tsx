import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { ActivityEntity } from "@/types/activities";

interface KanbanCardProps {
  task: ActivityEntity;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => (
  <Flex
    p={4}
    bg="brand.gray"
    borderRadius="md"
    // boxShadow="md"
    w="full"
    direction={"column"}
  >
    <Text fontSize={"12px"} fontWeight={"bold"}>
      {task.name}
    </Text>
    <Flex mt={"2"} direction={"column"}>
      <Flex>
        <Text fontSize={"10px"} mr={"1"}>
          Start Date:
        </Text>
        <Text fontSize={"10px"} fontWeight={"semibold"}>
          {task.start}
        </Text>
      </Flex>
      <Flex>
        <Text fontSize={"10px"} mr={"1"}>
          End Date:
        </Text>
        <Text fontSize={"10px"} fontWeight={"semibold"}>
          {task.end}
        </Text>
      </Flex>
    </Flex>
  </Flex>
);

export default KanbanCard;
