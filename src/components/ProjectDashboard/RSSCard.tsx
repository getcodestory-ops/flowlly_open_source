import React, { useState } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { BiSolidCircle } from "react-icons/bi";
import {
  MdOutlinePlayCircleOutline,
  MdOpenInNew,
  MdOutlineEmail,
  MdOutlinePeopleAlt,
  MdOutlineSmsFailed,
} from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import { LuMessageSquare } from "react-icons/lu";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface RSSCardProps {
  title: string;
  date?: string;
  status?: string | undefined;
  type?: string | undefined;
  explanation?: string;
  severity?: string;
  source: string;
  index?: number;
}

function RSSCard({
  title,
  date,
  status,
  type,
  explanation,
  source,
  severity,
  index,
}: RSSCardProps) {
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);

  const handleClicked = () => {
    // Toggle visibility
    setIsExplanationVisible(!isExplanationVisible);
  };

  const iconDisplay = () => {
    return (
      <>
        {type === "email" && (
          <Icon as={MdOutlineEmail} color={"blue.500"} mr={"2"} />
        )}
        {type === "task" && (
          <Icon as={LuMessageSquare} color={"blue.500"} mr={"2"} />
        )}
        {type === "rfi" && (
          <Icon as={IoMdInformationCircleOutline} color={"blue.500"} mr={"2"} />
        )}
        {type === "quality" && (
          <Icon as={MdOutlineSmsFailed} color={"blue.500"} mr={"2"} />
        )}
        {type === "meeting" && (
          <Icon as={MdOutlinePeopleAlt} color={"blue.500"} mr={"2"} />
        )}
      </>
    );
  };

  const truncatedTitle =
    title.length > 15 ? title.substring(0, 15) + "..." : title;

  return (
    <Flex
      onClick={handleClicked} // Adding click handler to the main Flex container
      alignItems={"center"}
      w={"full"}
      bg={"brand2.mid"}
      px={"3"}
      py={"3"}
      rounded={"md"}
      mb={"3"}
      fontSize={"xs"}
      cursor={"pointer"}
      direction={"column"}
      _hover={{ bg: "brand.dark", color: "white" }}
    >
      {!isExplanationVisible && (
        <Flex w={"full"} justifyContent={"space-between"} direction={"column"}>
          <Flex alignItems={"center"}>
            {status && (
              <Icon
                as={BiSolidCircle}
                color={status === "Delayed" ? "#FF4141" : "#FFA841"}
                mr={"2"}
              />
            )}

            {iconDisplay()}

            <Text fontWeight={"semibold"} ml={"2"} mr={"5"}>
              {/* {status || type
                ? title.substring(0, 15) + "..."
                : title.substring(0, 18) + "..."} */}
              {truncatedTitle}
            </Text>
          </Flex>

          <Flex fontStyle={"italic"} color={"gray.500"}>
            <Text>{date}</Text>
          </Flex>
        </Flex>
      )}
      {isExplanationVisible && (
        <Flex direction={"column"}>
          <Flex alignItems={"center"} mb={"2"} justifyContent={"space-between"}>
            <Flex fontStyle={"italic"} color={"gray.500"}>
              <Text>{date}</Text>
            </Flex>
            <Flex>
              {source === "action" && (
                <>
                  <Icon
                    as={MdOutlinePlayCircleOutline}
                    color={"blue.500"}
                    fontSize={"md"}
                    mr={"2"}
                  />
                  <Icon as={FiTrash} color={"blue.500"} fontSize={"md"} />
                </>
              )}
              {source === "risk" && (
                <>
                  <Icon
                    as={MdOpenInNew}
                    color={"blue.500"}
                    fontSize={"md"}
                    mr={"2"}
                  />
                  <Icon as={FiTrash} color={"blue.500"} fontSize={"md"} />
                </>
              )}
              {source === "update" && (
                <>
                  <Icon
                    as={MdOpenInNew}
                    color={"blue.500"}
                    fontSize={"md"}
                    mr={"2"}
                  />
                  <Icon as={FiTrash} color={"blue.500"} fontSize={"md"} />
                </>
              )}
            </Flex>
          </Flex>
          <Flex alignItems={"center"}>
            {status && (
              <Icon
                as={BiSolidCircle}
                color={status === "Delayed" ? "#FF4141" : "#FFA841"}
                mr={"2"}
              />
            )}
            <Text fontWeight={"semibold"} ml={"2"} mr={"5"}>
              {title}
            </Text>
          </Flex>

          <Flex mt={"2"}>{explanation}</Flex>
        </Flex>
      )}
    </Flex>
  );
}

export default RSSCard;
