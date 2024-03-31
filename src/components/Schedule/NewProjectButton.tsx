import React, { useState } from "react";
import { Box, Button, Icon, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import AddNewProjectModal from "./AddNewProjectModal";

const CreateNewProjectButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  return (
    <Flex alignItems="center" width="full">
      <Button
        bg={"brand.dark"}
        // leftIcon={<Icon as={FiPlus} />}
        _hover={{ bg: "brand.accent", color: "brand.dark" }}
        onClick={onOpen}
        size={"xs"}
        color={"white"}
        py={"4"}
      >
        New Project
      </Button>
      <AddNewProjectModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default CreateNewProjectButton;
