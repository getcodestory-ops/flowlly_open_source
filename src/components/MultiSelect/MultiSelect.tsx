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
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    existingSelection ?? []
  );

  const handleOptionSelect = (selected: string | string[]) => {
    console.log(selected);
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

  return (
    <Flex direction={"column"}>
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
            <MenuOptionGroup
              value={selectedOptions}
              onChange={handleOptionSelect}
              type="checkbox"
            >
              <Flex direction={"column"} gap="2" px="4" py="2">
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
                options.map((option) => (
                  <MenuItemOption
                    key={`option_${option.id}`}
                    value={option.id}
                    _focus={{ bg: "yellow.100" }}
                    _hover={{ bg: "yellow.100" }}
                    transition={"background 0.3s ease"}
                  >
                    {option.label}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
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
