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
import { time } from "console";
import { type TimeConfig } from "@/types/taskQueue";

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
  const [deliveryTimeInput, setDeliveryTimeInput] = useState<string>("");
  const [selectedTimes, setSelectedTimes] = useState<TimeConfig[]>(
    editQueueItem.run_config.time ?? []
  );
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
    console.log(editQueueItem.run_config.time_zone);
    setSelectedTimes(editQueueItem.run_config.time);
  }, [editQueueItem]);

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
    timeInput &&
      setEditQueueItem((prev) => ({
        ...prev,
        run_config: {
          ...prev.run_config,
          time: [
            ...prev.run_config.time,
            { run_time: timeInput, delivery_time: deliveryTimeInput },
          ],
        },
      }));

    if (
      timeInput &&
      !selectedTimes.includes({
        run_time: timeInput,
        delivery_time: deliveryTimeInput,
      })
    ) {
      setSelectedTimes([
        ...selectedTimes,
        { run_time: timeInput, delivery_time: deliveryTimeInput },
      ]);
      setTimeInput(""); // Reset input after adding
    }
  };

  const handleRemoveTime = (time: string) => {
    setEditQueueItem((prev) => ({
      ...prev,
      run_config: {
        ...prev.run_config,
        time: prev.run_config.time.filter((t) => t.run_time !== time),
      },
    }));
    setSelectedTimes(selectedTimes.filter((t) => t.run_time !== time));
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
                  <Select
                    onChange={(e) =>
                      setEditQueueItem({
                        ...editQueueItem,
                        task_function: e.target.value,
                      })
                    }
                    value={editQueueItem.task_function}
                  >
                    <option value="generate_daily_briefing">
                      Send Daily Updates
                    </option>
                    <option value="process_task_history">
                      Generate Daily Report
                    </option>
                    <option value="get_project_updates">
                      Get Project Updates
                    </option>
                  </Select>

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
                      { id: "0", label: "Monday" },
                      { id: "1", label: "Tuesday" },
                      { id: "2", label: "Wednesday" },
                      { id: "3", label: "Thursday" },
                      { id: "4", label: "Friday" },
                      { id: "5", label: "Saturday" },
                      { id: "6", label: "Sunday" },
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
                    <Text>Task Execution time : Task Delivery time</Text>
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

                        <Input
                          placeholder="HH:MM"
                          value={deliveryTimeInput}
                          onChange={(e) => setDeliveryTimeInput(e.target.value)}
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
                            <TagLabel>
                              {time.run_time} :{" "}
                              {time.delivery_time ?? "Not set"}
                            </TagLabel>
                            <TagCloseButton
                              onClick={() => handleRemoveTime(time.run_time)}
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
