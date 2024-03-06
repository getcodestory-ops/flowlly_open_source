import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  Icon,
  border,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { UpdateActivityTypes } from "@/types/activities";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { updateActivity } from "@/api/activity_routes";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function ActivityEditView() {
  const { taskToView, session, activeProject } = useStore((state) => ({
    taskToView: state.taskToView,
    session: state.session,
    activeProject: state.activeProject,
  }));
  // const [activity, setActivity] = useState<UpdateActivityTypes>({
  //   id: "",
  //   name: "",
  //   description: "",
  //   duration: 0,
  //   start: "",
  //   end: "",
  //   cost: 0,
  //   owner: "",
  //   progress: 0,
  //   dependencies: [],
  //   resources: [],
  //   status: "",
  // });

  const dateAdjustment = (date: string) => {
    let currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate;
  };

  const [startDate, onStartChange] = useState<Value>(
    dateAdjustment(taskToView.start)
  );
  const [endDate, onEndChange] = useState<Value>(
    dateAdjustment(taskToView.end)
  );

  const durantionCalculation = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Flex
      ml={"6"}
      mt={"6"}
      direction={"column"}
      overflowY={"auto"}
      overscrollBehaviorY={"contain"}
    >
      <Flex
        justifyContent={"space-between"}
        alignItems={"center"}
        minW={"500px"}
      >
        <Flex direction={"column"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Start Date:
          </Text>
          <Flex fontSize={"sm"}>
            <DatePicker onChange={onStartChange} value={startDate} />
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            End Date:
          </Text>
          <Flex fontSize={"sm"}>
            <DatePicker onChange={onEndChange} value={endDate} />
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Duration:
          </Text>
          <Flex fontSize={"sm"} as={"b"}>
            {startDate &&
              endDate &&
              durantionCalculation(startDate as Date, endDate as Date)}{" "}
            days
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          <Text fontSize={"sm"} as={"i"} mr={"2"}>
            Progress:
          </Text>
          <Input
            size={"sm"}
            borderColor={"brand.dark"}
            w={"70px"}
            placeholder="%"
            focusBorderColor="brand.dark"
          />
        </Flex>
      </Flex>
      <Flex direction={"column"} mt={"4"}>
        <Text fontSize={"sm"} as={"i"} mr={"2"}>
          Task Owner:
        </Text>
        <Flex>
          <Select
            focusBorderColor="brand.dark"
            w={"40%"}
            borderColor={"brand.dark"}
            size={"sm"}
          >
            <option value="option1">Employee 1</option>
            <option value="option2">Employee 2</option>
            <option value="option3">Employee 3</option>
            <option value="option4">Employee 4</option>
            <option value="option4">Employee 5</option>
          </Select>
        </Flex>
      </Flex>
      <Flex direction={"column"} mt={"4"}>
        <Text fontSize={"sm"} as={"i"} mr={"2"}>
          Task Description:
        </Text>
        <Text
          fontSize={"sm"}
          fontWeight={"semibold"}
          color={`${!taskToView.description ? "red" : "black"}`}
        >
          {taskToView && taskToView.description
            ? taskToView.description
            : "This task has no description"}
        </Text>
      </Flex>
      <Flex direction={"column"} mt={"4"}>
        <Text fontSize={"sm"} as={"i"} mr={"2"}>
          Task Estimated Cost:
        </Text>
        <Input
          size={"sm"}
          borderColor={"brand.dark"}
          w={"40%"}
          placeholder="$"
          focusBorderColor="brand.dark"
        />
      </Flex>
      <Flex direction={"column"} mt={"4"}>
        <Text fontSize={"sm"} as={"i"} mr={"2"}>
          Task Resources:
        </Text>
        <Select
          focusBorderColor="brand.dark"
          w={"40%"}
          borderColor={"brand.dark"}
          size={"sm"}
        >
          <option value="option1">Resource 1</option>
          <option value="option2">Resource 2</option>
          <option value="option3">Resource 3</option>
          <option value="option4">Resource 4</option>
          <option value="option4">Resource 5</option>
        </Select>
      </Flex>
    </Flex>
  );
}

export default ActivityEditView;
