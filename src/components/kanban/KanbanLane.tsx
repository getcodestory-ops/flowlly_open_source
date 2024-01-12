import React from "react";
import { VStack, Text, Flex } from "@chakra-ui/react";
import KanbanCard from "./KanbanCard";
import { Droppable } from "react-beautiful-dnd";
import { ActivityEntity } from "@/types/activities";

interface LaneProps {
  title: string;
  tasks: ActivityEntity[];
}

const KanbanLane: React.FC<LaneProps> = ({ title, tasks }) => (
  <Droppable droppableId={title}>
    {(provided) => (
      <>
        <Flex direction={"column"}>
          <Flex mb={"4"}>
            <Text fontSize="14px" fontWeight="bold">
              {title}
            </Text>
          </Flex>
          <VStack
            {...provided.droppableProps}
            ref={provided.innerRef}
            width="250px"
            // maxHeight="350px" // Set a fixed maximum height
            // overflowY="auto" // Enable vertical scrolling
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            {provided.placeholder}
          </VStack>
        </Flex>
      </>
    )}
  </Droppable>
);

export default KanbanLane;
