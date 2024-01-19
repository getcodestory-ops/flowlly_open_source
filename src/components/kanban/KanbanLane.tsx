import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import TaskCard from "./KanbanCard";
import { useDrop } from "react-dnd";

const KanbanLane = ({ status, tasks, onDrop }) => {
  const [, dropRef] = useDrop(() => ({
    accept: "task",
    drop: (item, monitor) => onDrop(item, status),
  }));

  return (
    <Flex
      ref={dropRef}
      w="200px"
      p="2"
      bg={`${
        status === "Delayed"
          ? "red.100"
          : status === "At Risk"
          ? "orange.100"
          : "brand.background"
      }`}
      rounded={"lg"}
      m="2"
      direction={"column"}
      cursor={"grab"}
    >
      <Text fontSize="14px" fontWeight={"bold"}>
        {status}
      </Text>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </Flex>
  );
};

export default KanbanLane;
