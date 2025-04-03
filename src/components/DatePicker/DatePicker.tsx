"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useStore } from "@/utils/store";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  onDateSelect?: (selectedDate: Date) => void;
}

export default function CustomDatePicker({
	onDateSelect,
}: CustomDatePickerProps) {
	const [date, setDate] = useState<Date>(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
	const setScheduleDate = useStore((state) => state.setScheduleDate);

	// Simulating the impactful revisions data
	useEffect(() => {
		// This is where you'd fetch your actual data
		const mockImpactfulDates = [
			new Date(2023, 5, 15),
			new Date(2023, 5, 20),
			new Date(2023, 6, 5),
		];
		setHighlightedDates(mockImpactfulDates);
	}, []);

	const handleSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate);
			const formattedDate = new Date(selectedDate);
			setScheduleDate(formattedDate);
			if (onDateSelect) {
				onDateSelect(selectedDate);
			}
			setIsCalendarOpen(false);
		}
	};

	return (
		<div className="flex items-center space-x-2 bg-white z-20">
			<span className="text-sm font-bold">Tasks on:</span>
			<Popover onOpenChange={setIsCalendarOpen} open={isCalendarOpen}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"w-[240px] justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
						variant="outline"
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? date.toDateString() : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						initialFocus
						mode="single"
						modifiers={{
							highlighted: highlightedDates,
						}}
						modifiersStyles={{
							highlighted: { backgroundColor: "red", color: "white" },
						}}
						onSelect={handleSelect}
						selected={date}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
