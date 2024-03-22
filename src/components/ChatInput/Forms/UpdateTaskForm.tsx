import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  Textarea,
  Collapse,
  IconButton,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { AgentChat } from "@/types/agentChats";

import {
  FaChevronCircleDown,
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaChevronCircleUp,
} from "react-icons/fa";
function UpdateTaskForm({
  collapse = false,
  data,
}: {
  collapse?: boolean;
  data: AgentChat;
}) {
  // Initialize state with the existing task data
  const [formIndex, setFormIndex] = useState(0);
  const [task, setTask] = useState({
    name: "",
    details: "",
    duration: 0,
    startAfter: 0,
  });

  useEffect(() => {
    if (!data) return;
    if (formIndex >= data.message.metadata.length) {
      setFormIndex(formIndex - 1);
      return;
    }
    setTask({
      name: data.message.metadata[formIndex].name,
      details: data.message.metadata[formIndex].details,
      duration: data.message.metadata[formIndex].duration,
      startAfter: data.message.metadata[formIndex].startAfter,
    });
  }, [data, formIndex]);

  const [isFormOpen, setIsFormOpen] = useState(collapse);

  const toast = useToast();

  // Handles the form submit action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement the update logic here. For example, send the updated task to an API.
    toast({
      title: "Task updated.",
      description: "The task has been updated successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  // Handles input changes for all fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box maxW="md" borderWidth="1px" borderRadius="lg" p={4} mb={4}>
      <Flex justifyContent={"space-between"}>
        <Button
          aria-label={isFormOpen ? "Collapse Form" : "Expand Form"}
          onClick={() => setIsFormOpen(!isFormOpen)}
          mb={isFormOpen ? 2 : 0}
          size="xs"
          colorScheme="yellow"
          rightIcon={
            isFormOpen ? <FaChevronCircleDown /> : <FaChevronCircleUp />
          }
        >
          Confirm ai action
        </Button>
        {data && formIndex + 1 < data.message.metadata.length && (
          <Button
            aria-label={isFormOpen ? "Collapse Form" : "Expand Form"}
            onClick={() => setFormIndex((state) => state + 1)}
            mb={isFormOpen ? 2 : 0}
            size="xs"
            colorScheme="yellow"
            rightIcon={<FaChevronCircleRight />}
          >
            Next Item
          </Button>
        )}
      </Flex>
      <Collapse in={isFormOpen} animateOpacity>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired mb={4}>
            <FormLabel htmlFor="name" fontSize="xs">
              Task Name
            </FormLabel>
            <Input
              fontSize="xs"
              id="name"
              name="name"
              value={task.name}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel htmlFor="details" fontSize="xs">
              Details
            </FormLabel>
            <Textarea
              id="details"
              name="details"
              value={task.details}
              onChange={handleChange}
              fontSize="xs"
            />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel htmlFor="duration" fontSize="xs">
              Duration
            </FormLabel>
            <NumberInput min={0}>
              <NumberInputField
                id="duration"
                name="duration"
                value={task.duration}
                onChange={handleChange}
              />
            </NumberInput>
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel htmlFor="startAfter" fontSize="xs">
              Start After
            </FormLabel>
            <NumberInput min={0}>
              <NumberInputField
                id="startAfter"
                name="startAfter"
                value={task.startAfter}
                onChange={handleChange}
              />
            </NumberInput>
          </FormControl>
          <Button
            mt={4}
            size="xs"
            colorScheme="yellow"
            type="submit"
            fontSize="xs"
          >
            Update Task
          </Button>
        </form>
      </Collapse>
    </Box>
  );
}

export default UpdateTaskForm;
