import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";

interface RSSCardProps {
  title: string;
  date: string;
  status: string | undefined;
}

function RSSCard({ title, date, status }: RSSCardProps) {
  return (
    <Flex
      alignItems={"center"}
      w={"full"}
      justifyContent={"space-between"}
      bg={"brand.light"}
      px={"3"}
      py={"3"}
      rounded={"md"}
      mb={"3"}
      fontSize={"sm"}
    >
      <Flex alignItems={"center"}>
        <Icon
          as={BiSolidCircle}
          color={status === "Delayed" ? "#FF4141" : "#FFA841"}
          mr={"2"}
        />
        <Text fontWeight={"semibold"} ml={"2"}>
          {title}
        </Text>
      </Flex>

      <Flex fontStyle={"italic"} color={"gray.500"}>
        <Text>{date}</Text>
      </Flex>
    </Flex>
  );
}

export default RSSCard;
