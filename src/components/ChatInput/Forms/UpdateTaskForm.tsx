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
			name: data.message.metadata[formIndex]?.name,
			details: data.message.metadata[formIndex]?.details,
			duration: data.message.metadata[formIndex]?.duration,
			startAfter: data.message.metadata[formIndex]?.startAfter,
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
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setTask((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<Box
			borderRadius="lg"
			borderWidth="1px"
			maxW="md"
			mb={4}
			p={4}
		>
			<Flex justifyContent="space-between">
				<Button
					aria-label={isFormOpen ? "Collapse Form" : "Expand Form"}
					colorScheme="yellow"
					mb={isFormOpen ? 2 : 0}
					onClick={() => setIsFormOpen(!isFormOpen)}
					rightIcon={
						isFormOpen ? <FaChevronCircleDown /> : <FaChevronCircleUp />
					}
					size="xs"
				>
          Confirm ai action
				</Button>
				{data && formIndex + 1 < data.message.metadata.length && (
					<Button
						aria-label={isFormOpen ? "Collapse Form" : "Expand Form"}
						colorScheme="yellow"
						mb={isFormOpen ? 2 : 0}
						onClick={() => setFormIndex((state) => state + 1)}
						rightIcon={<FaChevronCircleRight />}
						size="xs"
					>
            Next Item
					</Button>
				)}
			</Flex>
			<Collapse animateOpacity in={isFormOpen}>
				<form onSubmit={handleSubmit}>
					<FormControl isRequired mb={4}>
						<FormLabel fontSize="xs" htmlFor="name">
              Task Name
						</FormLabel>
						<Input
							fontSize="xs"
							id="name"
							name="name"
							onChange={handleChange}
							value={task.name}
						/>
					</FormControl>
					<FormControl isRequired mb={4}>
						<FormLabel fontSize="xs" htmlFor="details">
              Details
						</FormLabel>
						<Textarea
							fontSize="xs"
							id="details"
							name="details"
							onChange={handleChange}
							value={task.details}
						/>
					</FormControl>
					<FormControl isRequired mb={4}>
						<FormLabel fontSize="xs" htmlFor="duration">
              Duration
						</FormLabel>
						<NumberInput min={0}>
							<NumberInputField
								id="duration"
								name="duration"
								onChange={handleChange}
								value={task.duration}
							/>
						</NumberInput>
					</FormControl>
					<FormControl isRequired mb={4}>
						<FormLabel fontSize="xs" htmlFor="startAfter">
              Start After
						</FormLabel>
						<NumberInput min={0}>
							<NumberInputField
								id="startAfter"
								name="startAfter"
								onChange={handleChange}
								value={task.startAfter}
							/>
						</NumberInput>
					</FormControl>
					<Button
						colorScheme="yellow"
						fontSize="xs"
						mt={4}
						size="xs"
						type="submit"
					>
            Update Task
					</Button>
				</form>
			</Collapse>
		</Box>
	);
}

export default UpdateTaskForm;
