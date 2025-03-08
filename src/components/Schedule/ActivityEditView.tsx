import React, { useState } from "react";
import { Flex, Text, Input, Select } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function ActivityEditView() {
	const { taskToView } = useStore((state) => ({
		taskToView: state.taskToView,
	}));

	const dateAdjustment = (date: string) => {
		let currentDate = new Date(date);
		currentDate.setDate(currentDate.getDate() + 1);
		return currentDate;
	};

	const [startDate, onStartChange] = useState<Value>(
		taskToView ? dateAdjustment(taskToView.start) : null,
	);
	const [endDate, onEndChange] = useState<Value>(
		taskToView ? dateAdjustment(taskToView.end) : null,
	);

	const durantionCalculation = (startDate: Date, endDate: Date) => {
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	if (!taskToView) return null;

	return (
		<Flex
			direction="column"
			ml="6"
			mt="6"
			overflowY="auto"
			overscrollBehaviorY="contain"
		>
			<Flex
				alignItems="center"
				justifyContent="space-between"
				minW="500px"
			>
				<Flex direction="column">
					<Text
						as="i"
						fontSize="sm"
						mr="2"
					>
            Start Date:
					</Text>
					<Flex fontSize="sm">
						<DatePicker onChange={onStartChange} value={startDate} />
					</Flex>
				</Flex>
				<Flex direction="column">
					<Text
						as="i"
						fontSize="sm"
						mr="2"
					>
            End Date:
					</Text>
					<Flex fontSize="sm">
						<DatePicker onChange={onEndChange} value={endDate} />
					</Flex>
				</Flex>
				<Flex direction="column">
					<Text
						as="i"
						fontSize="sm"
						mr="2"
					>
            Duration:
					</Text>
					<Flex as="b" fontSize="sm">
						{startDate &&
              endDate &&
              durantionCalculation(startDate as Date, endDate as Date)}{" "}
            days
					</Flex>
				</Flex>
				<Flex direction="column">
					<Text
						as="i"
						fontSize="sm"
						mr="2"
					>
            Progress:
					</Text>
					<Input
						borderColor="brand.dark"
						focusBorderColor="brand.dark"
						placeholder="%"
						size="sm"
						w="70px"
					/>
				</Flex>
			</Flex>
			<Flex direction="column" mt="4">
				<Text
					as="i"
					fontSize="sm"
					mr="2"
				>
          Task Owner:
				</Text>
				<Flex>
					<Select
						borderColor="brand.dark"
						focusBorderColor="brand.dark"
						size="sm"
						w="40%"
					>
						<option value="option1">Employee 1</option>
						<option value="option2">Employee 2</option>
						<option value="option3">Employee 3</option>
						<option value="option4">Employee 4</option>
						<option value="option4">Employee 5</option>
					</Select>
				</Flex>
			</Flex>
			<Flex direction="column" mt="4">
				<Text
					as="i"
					fontSize="sm"
					mr="2"
				>
          Task Description:
				</Text>
				<Text
					color={`${!taskToView?.description ? "red" : "black"}`}
					fontSize="sm"
					fontWeight="semibold"
				>
					{taskToView && taskToView.description
						? taskToView.description
						: "This task has no description"}
				</Text>
			</Flex>
			<Flex direction="column" mt="4">
				<Text
					as="i"
					fontSize="sm"
					mr="2"
				>
          Task Estimated Cost:
				</Text>
				<Input
					borderColor="brand.dark"
					focusBorderColor="brand.dark"
					placeholder="$"
					size="sm"
					w="40%"
				/>
			</Flex>
			<Flex direction="column" mt="4">
				<Text
					as="i"
					fontSize="sm"
					mr="2"
				>
          Task Resources:
				</Text>
				<Select
					borderColor="brand.dark"
					focusBorderColor="brand.dark"
					size="sm"
					w="40%"
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
