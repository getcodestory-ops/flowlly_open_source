import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useDrag } from "react-dnd";

const TaskCard = ({ task }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const draggingStyle = isDragging
    ? { cursor: "grabbing" }
    : { cursor: "grab" };

  return (
    <Flex
      ref={dragRef}
      p="4"
      bg="white"
      m="2"
      shadow="md"
      opacity={isDragging ? 0.5 : 1}
      rounded={"lg"}
      style={draggingStyle}
    >
      <Text fontSize={"12px"}>{task.name}</Text>
    </Flex>
  );
};

export default TaskCard;
