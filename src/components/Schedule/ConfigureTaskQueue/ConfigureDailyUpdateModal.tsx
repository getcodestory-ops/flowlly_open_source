import React, { useRef, useEffect, useState } from "react";
import { ChangeEventHandler } from "react";
import {
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  useToast,
  Text,
  Select,
  List,
  ListItem,
  ListIcon,
  useOutsideClick,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { useConfigureTaskQueue } from "./useCofigureTaskQueue";
import { AddTaskQueue } from "@/types/taskQueue";
import MultiSelect from "@/components/MultiSelect/MultiSelect";
import { MemberEntity } from "@/types/members";
import { timezones } from "./timezones";
import { MdDeleteOutline } from "react-icons/md";

function UpdateDailyUpdateScheduleModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    taskQueue,
    members,
    defaultQueueItem,
    editQueueItem,
    setEditQueueItem,
    saveTaskQueue,
    deleteTaskQueueItem,
  } = useConfigureTaskQueue();
  const [timezoneFilter, setTimezoneFilter] = useState("");
  const [showTimezoneOptions, setShowTimezoneOptions] = useState(false);
  const [timeInput, setTimeInput] = useState<string>("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: ref,
    handler: () => setShowTimezoneOptions(false),
  });

  const filteredTimezones = timezones.filter((tz) =>
    tz.toLowerCase().includes(timezoneFilter.toLowerCase())
  );

  useEffect(() => {
    setTimezoneFilter(editQueueItem.run_config.time_zone);
    setSelectedTimes(editQueueItem.run_config.time);
  }, [editQueueItem.run_config.time_zone]);

  const handleDayChange = (selectedDays: string[]) => {
    const dayNumbers = selectedDays.map((day) => parseInt(day));
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        day: dayNumbers,
      },
    }));
  };

  const setStartDateTime = (date: string) =>
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        start: date,
      },
    }));

  const setEndDateTime = (date: string) =>
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        end: date,
      },
    }));

  const handleTaskOwnerIdsChange = (selectedOwners: string[]) => {
    setEditQueueItem((prev) => ({
      ...prev,
      task_args: {
        ...prev.task_args,
        task_owner_ids: selectedOwners,
      },
    }));
  };

  const handleTimezoneChange = (selectedOption: string) => {
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        time_zone: selectedOption,
      },
    }));
    setShowTimezoneOptions(false);
    setTimezoneFilter(selectedOption);
  };

  const handleAddTime = () => {
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        time: [...prev.run_config.time, timeInput],
      },
    }));
    if (timeInput && !selectedTimes.includes(timeInput)) {
      setSelectedTimes([...selectedTimes, timeInput]);
      setTimeInput(""); // Reset input after adding
    }
  };

  const handleRemoveTime = (time: string) => {
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        time: prev.run_config.time.filter((t) => t !== time),
      },
    }));
    setSelectedTimes(selectedTimes.filter((t) => t !== time));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent bg="brand.background">
        <ModalHeader>Configure Daily Update Schedule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDirection="row" gap="6">
            <Box flex="1">
              <Button
                onClick={() => setEditQueueItem(defaultQueueItem)}
                mb="4"
                colorScheme="yellow"
              >
                Add New Task Schedule
              </Button>
              <Text mb="4">Task Queue</Text>
              <Box overflowY="auto" maxH="xs">
                {taskQueue &&
                  taskQueue.length > 0 &&
                  taskQueue.map((task, index) => (
                    <Box
                      display={"flex"}
                      key={task.id}
                      onClick={() => setEditQueueItem(task)}
                      cursor="pointer"
                      p="2"
                      borderRadius={"lg"}
                      bg="gray.50"
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      _hover={{ bg: "yellow.100" }}
                      minH={"16"}
                    >
                      <Text>
                        {index + 1}. {task.task_name}
                      </Text>
                      {editQueueItem.id === task.id && (
                        <IconButton
                          aria-label="Delete Task"
                          variant={"ghost"}
                          icon={<MdDeleteOutline color="red" />}
                          onClick={() => deleteTaskQueueItem(task.id)}
                        />
                      )}
                    </Box>
                  ))}
              </Box>
            </Box>
            <Box flex="2">
              {editQueueItem && (
                <Flex flexDirection="column" gap="4">
                  <Input
                    placeholder="Task Name"
                    value={editQueueItem.task_name}
                    onChange={(e) =>
                      setEditQueueItem({
                        ...editQueueItem,
                        task_name: e.target.value,
                      })
                    }
                  />
                  <MultiSelect
                    title="Days"
                    options={[
                      { id: "0", label: "Sunday" },
                      { id: "1", label: "Monday" },
                      { id: "2", label: "Tuesday" },
                      { id: "3", label: "Wednesday" },
                      { id: "4", label: "Thursday" },
                      { id: "5", label: "Friday" },
                      { id: "6", label: "Saturday" },
                    ]}
                    onChange={handleDayChange}
                    existingSelection={editQueueItem.run_config.day.map(String)}
                  />
                  <MultiSelect
                    title="Assignees"
                    options={members?.data.map((member: MemberEntity) => ({
                      label: `${member.first_name} ${member.last_name}`,
                      id: member.id,
                    }))}
                    existingSelection={editQueueItem.task_args.task_owner_ids}
                    onChange={handleTaskOwnerIdsChange}
                  />
                  <Flex flexDirection="column" gap="4">
                    <Text>Start task from</Text>
                    <Input
                      type="date"
                      value={editQueueItem.run_config.start.split("T")[0]}
                      onChange={(e) => setStartDateTime(e.target.value)}
                    />
                    <Text>Run Task until</Text>
                    <Input
                      type="date"
                      value={editQueueItem.run_config.end?.split("T")[0]}
                      onChange={(e) => setEndDateTime(e.target.value)}
                    />
                    select time zone here
                    <Box position="relative" ref={ref}>
                      <Input
                        placeholder="Filter Timezones"
                        value={timezoneFilter}
                        onChange={(e) => setTimezoneFilter(e.target.value)}
                        onFocus={() => setShowTimezoneOptions(true)}
                      />
                      {showTimezoneOptions && (
                        <List
                          spacing={2}
                          bg="white"
                          mt={1}
                          boxShadow="md"
                          position="absolute"
                          width="full"
                          zIndex="dropdown"
                          maxH="xs"
                          overflow={"auto"}
                        >
                          {filteredTimezones.map((timezone) => (
                            <ListItem
                              key={timezone}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: "gray.100" }}
                              onClick={() => handleTimezoneChange(timezone)}
                            >
                              {timezone}
                            </ListItem>
                          ))}
                          {filteredTimezones.length === 0 && (
                            <ListItem p={2}>No results found.</ListItem>
                          )}
                        </List>
                      )}
                    </Box>
                    <Text>Run times</Text>
                    <VStack spacing={4} align="start">
                      <Box>
                        <Input
                          placeholder="HH:MM"
                          value={timeInput}
                          onChange={(e) => setTimeInput(e.target.value)}
                          size="md"
                          width="auto"
                          mr={2}
                          type="time"
                        />
                        <Button onClick={handleAddTime} colorScheme="yellow">
                          Add Time
                        </Button>
                      </Box>
                      <HStack spacing={2}>
                        {selectedTimes.map((time, index) => (
                          <Tag size="lg" key={index} borderRadius="full">
                            <TagLabel>{time}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleRemoveTime(time)}
                            />
                          </Tag>
                        ))}
                      </HStack>
                    </VStack>
                  </Flex>
                </Flex>
              )}
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button mr="3" onClick={onClose} variant={"ghost"}>
            Close
          </Button>
          <Button colorScheme="yellow" onClick={saveTaskQueue}>
            {editQueueItem.id ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default UpdateDailyUpdateScheduleModal;
