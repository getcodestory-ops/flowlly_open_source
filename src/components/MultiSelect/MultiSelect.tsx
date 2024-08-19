import React, { useEffect, useState } from "react";
import {
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Flex,
  Divider,
  Badge,
  Icon,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { BiCaretDown } from "react-icons/bi";
import { IoFunnel, IoClose } from "react-icons/io5";

interface MultiSelectProps {
  title: string;
  options: {
    id: string;
    label: string;
  }[];
  onChange?: (selected: string[]) => void;
  existingSelection?: string[];
}

const MultiSelect = ({
  title,
  options,
  onChange = () => {},
  existingSelection = [],
}: MultiSelectProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionSelect = (selected: string | string[]) => {
    const list = Array.isArray(selected)
      ? selected
      : [...selectedOptions, selected];

    setSelectedOptions(list);
    onChange(list);
  };

  const handleClear = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  useEffect(() => {
    //console.log("loading multiselect");
    setSelectedOptions(existingSelection);
  }, [existingSelection]);

  return (
    <Flex direction={"column"} overflow="scroll" maxHeight={"64"}>
      <Flex gap="4" align={"center"}>
        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            colorScheme="brand.accent"
            variant={"outline"}
            rightIcon={<Icon as={BiCaretDown} />}
            maxW={"2xs"}
          >
            <Flex align="center" gap="2">
              <Text noOfLines={1}>{title}</Text>

              <Badge bg="brand.accent" color="black">
                {selectedOptions && selectedOptions.length}
              </Badge>
            </Flex>
          </MenuButton>
          <MenuList minWidth="xs" maxW={"sm"}>
            <Box
              maxHeight={"64"}
              overflowY={"scroll"}
              className="custom-scrollbar"
            >
              <MenuOptionGroup
                value={selectedOptions ?? []}
                onChange={handleOptionSelect}
                type="checkbox"
              >
                <Flex
                  direction={"column"}
                  gap="2"
                  px="4"
                  py="2"
                  overflow={"scroll"}
                >
                  <Flex justify={"space-between"} align="center">
                    <Flex gap="2" align={"center"}>
                      <Icon as={IoFunnel} />
                      <Text size="md" noOfLines={1} fontWeight={"medium"}>
                        {title}
                      </Text>
                    </Flex>
                    <Flex flexShrink={0} gap="2">
                      <Button
                        size="xs"
                        variant="link"
                        colorScheme="yellow"
                        onClick={() =>
                          handleOptionSelect(options.map((o) => o.id))
                        }
                      >
                        Select All
                      </Button>

                      <Button
                        size="xs"
                        variant="link"
                        colorScheme="yellow"
                        onClick={handleClear}
                      >
                        Clear
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>

                <Divider />

                {options &&
                  options.length > 0 &&
                  options.map((activities, index) => (
                    // <Flex>{option.label ?? index}</Flex>
                    <MenuItemOption
                      key={`option_${activities.id ?? index}`}
                      value={activities.id ?? index}
                      _focus={{ bg: "yellow.100" }}
                      _hover={{ bg: "yellow.100" }}
                      transition={"background 0.3s ease"}
                    >
                      {activities.label ?? index}
                    </MenuItemOption>
                  ))}
              </MenuOptionGroup>
            </Box>
          </MenuList>
        </Menu>

        {selectedOptions && selectedOptions.length > 0 && (
          <IconButton
            aria-label="Clear"
            size="xs"
            colorScheme="yellow"
            rounded={"full"}
            icon={<Icon as={IoClose} />}
            ml="-8"
            mt="-8"
            onClick={handleClear}
          />
        )}
      </Flex>
    </Flex>
  );
};

export default MultiSelect;
