import { Button, Tooltip, Icon, Text, Flex } from "@chakra-ui/react";
import { MdOutlineSchedule } from "react-icons/md";
import { useState } from "react";
import UpdateDailyUpdateScheduleModal from "./ConfigureDailyUpdateModal";

const ConfigureDailyUpdate = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);

  const onClose = () => setIsOpen(false);

  return (
    <>
      {isOpen && <UpdateDailyUpdateScheduleModal />}
      {!hovered ? (
        <Flex>
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
              className="custom-shadow"
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
        <Flex>
          <Button
            mx={"2"}
            size={"sm"}
            bg={"none"}
            color={"white"}
            className="custom-shadow"
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
            <Text
              fontSize={"12px"}
              color={"white"}
              ml={"2"}
              fontWeight={"medium"}
            >
              Configuration
            </Text>
          </Button>
        </Flex>
      )}
    </>
  );
};

export default ConfigureDailyUpdate;
