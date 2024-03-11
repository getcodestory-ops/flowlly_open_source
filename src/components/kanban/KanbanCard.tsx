import React, { useEffect } from "react";
import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { ActivityEntity } from "@/types/activities";
import { useStore } from "@/utils/store";

interface OwnerDetails {
  initials: string;
  firstName: string;
  lastName: string;
}

const TaskCard = ({ task }: { task: ActivityEntity }) => {
  const { members } = useStore((state) => ({
    members: state.members,
  }));

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    console.log("task", task);
  }, [task]);

  const draggingStyle = isDragging
    ? { cursor: "grabbing" }
    : { cursor: "grab" };

  function extractOwnerDetails(activity: any, members: any): OwnerDetails[] {
    // Check if owners exist
    if (!activity.owner) {
      return [];
    }

    const ownerDetails: OwnerDetails[] = [];

    activity.owner.forEach((ownerId: any) => {
      const matchingMember = members.find(
        (member: any) => member.id === ownerId
      );

      if (matchingMember) {
        ownerDetails.push({
          initials:
            `${matchingMember.first_name[0]}${matchingMember.last_name[0]}`.toUpperCase(),
          firstName: matchingMember.first_name,
          lastName: matchingMember.last_name,
        });
      }
    });

    return ownerDetails;
  }

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
      direction={"column"}
    >
      <Text fontSize={"12px"}>{task.name}</Text>

      <Flex>
        {extractOwnerDetails(task, members).map((owner, index) => (
          <>
            <Tooltip
              label={owner.firstName + " " + owner.lastName}
              aria-label="A tooltip"
              bg="white"
              color="brand.dark"
            >
              <Flex
                key={index}
                bg={"brand.dark"}
                color={"white"}
                rounded={"full"}
                fontSize={"8px"}
                fontWeight={"bold"}
                mr={1}
                mt={"2"}
                w={"18px"}
                h={"18px"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {owner.initials}
              </Flex>
            </Tooltip>
          </>
        ))}
      </Flex>
    </Flex>
  );
};

export default TaskCard;
