import React, { useState } from "react";
import { Box, Button, Icon } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import AddNewProjectModal from "./AddNewProjectModal";

const CreateNewProjectButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  return (
    <Box
      display="flex"
      alignItems="center"
      bg="brand.md"
      p={2}
      width="full"
      borderRadius="md"
    >
      <Button
        leftIcon={<Icon as={FiPlus} />}
        width="full"
        variant="outline"
        borderColor="white"
        _hover={{ bg: "gray.600" }}
        onClick={onOpen}
      >
        New Project
      </Button>
      <AddNewProjectModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default CreateNewProjectButton;
