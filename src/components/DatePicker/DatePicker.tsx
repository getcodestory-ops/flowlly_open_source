import React, { useState, useEffect } from "react";
import { Flex, Text, Grid, GridItem, Select, Icon } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoCalendarOutline } from "react-icons/io5";
import { getRevisions } from "@/api/activity_routes";

interface ActivityRevision {
  name: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
  probability: number;
}

interface CustomDatePickerProps {
  onDateSelect?: (selectedDate: string) => void;
}

function CustomDatePicker({ onDateSelect }: CustomDatePickerProps) {
  const {
    session,
    activeProject,
    setTaskToView,
    setRightPanelView,
    scheduleDate,
    setScheduleDate,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setTaskToView: state.setTaskToView,
    setRightPanelView: state.setRightPanelView,
    scheduleDate: state.scheduleDate,
    setScheduleDate: state.setScheduleDate,
  }));
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [probability, setProbability] = useState<number>(0.5);
  const [impactfulRevisions, setImpactfulRevisions] = useState<any>([]);

  const dateAdjustment = () => {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate;
  };

  const [startDate, onStartChange] = useState<any>(dateAdjustment());
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  const months = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "June",
    7: "July",
    8: "Aug",
    9: "Sept",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const queryClient = useQueryClient();

  const { data: revisions, isLoading: LoadingRevisions } = useQuery({
    queryKey: ["revisionsList", session, activeProject],
    queryFn: () => getRevisions(session!, activeProject!.project_id),
    enabled: !!session?.access_token,
  });

  useEffect(() => {
    if (revisions) {
      console.log("revisions", revisions);

      // Reset impactfulRevisions to an empty array
      setImpactfulRevisions([]);

      for (let revision of revisions) {
        for (let r of revision.revision) {
          const newRevision = {
            date: parseDate(r.created_at ?? ""),
            probability: r.probability,
          };

          // Update the state by adding each newRevision
          setImpactfulRevisions((state: any) => [...state, newRevision]);
        }
      }
    }
  }, [revisions]);

  const [highlightedDates, setHighlightedDates] = useState<any>([]);

  function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  function getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month - 1, 1).getDay();
  }

  const monthSelector = (months: { [key: string]: string }) => (
    <Select
      size={"sm"}
      w={"100px"}
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
      className="calendar-selector"
    >
      {Object.keys(months).map((month, index) => (
        <option key={index} value={parseInt(month)}>
          {months[month]}
        </option>
      ))}
    </Select>
  );

  const yearSelector = (year: number) => {
    const years = [];
    for (let i = year + 5; i >= year - 10; i--) {
      years.push(i);
    }
    return (
      <Select
        className="calendar-selector"
        size={"sm"}
        w={"100px"}
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
      >
        {years.map((year, index) => (
          <option key={index} value={year}>
            {year}
          </option>
        ))}
      </Select>
    );
  };

  const handleDateClick = (day: number) => {
    setSelectedDay(day);
    setOpenCalendar((state) => !state);
    const selectedDate = `${selectedYear}-${selectedMonth}-${day}`;
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
    const formattedDate = new Date(selectedDate);
    setScheduleDate(formattedDate);
    console.log("formattedDate", formattedDate);
    // return formattedDate;
  };

  const days = [];
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  // Add empty grid items to align the first day under the correct weekday
  for (let i = 0; i < firstDay; i++) {
    days.push(
      <GridItem key={`empty-${i}`} colSpan={1} rowSpan={1} w={"50px"}>
        {/* Empty GridItem */}
      </GridItem>
    );
  }

  const isDateHighlighted = (day: number, month: number, year: number) => {
    return highlightedDates.some(
      (date: any) =>
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
    );
  };

  for (let i = 1; i <= getDaysInMonth(selectedMonth, selectedYear); i++) {
    const isHighlighted = isDateHighlighted(i, selectedMonth, selectedYear);

    days.push(
      <GridItem
        colSpan={1}
        rowSpan={1}
        key={i}
        w={"50px"}
        bg={isHighlighted ? "red" : ""}
        onClick={() => handleDateClick(i)}
        cursor={"pointer"}
      >
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Text
            fontWeight={isHighlighted ? "bold" : "regular"}
            color={isHighlighted ? "white" : "black"}
          >
            {i}
          </Text>
        </Flex>
      </GridItem>
    );
  }

  const handleForwardClick = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((state) => state + 1);
    } else {
      setSelectedMonth((state) => state + 1);
    }
  };

  const handleBackwardClick = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((state) => state - 1);
    } else {
      setSelectedMonth((state) => state - 1);
    }
  };

  function parseDate(dateString: string) {
    const date = new Date(dateString);

    return {
      year: date.getFullYear(),
      // getMonth returns a zero-based month, so adding 1 to get the correct month
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  const dateWindow = (month: number, year: number, day: number) => {
    return (
      <Flex
        fontSize={"xs"}
        alignItems={"center"}
        p={"1"}
        // border={"1px"}
        // borderColor={"red"}
        w={"120px"}
        justifyContent={"center"}
        onClick={() => setOpenCalendar((state) => !state)}
        cursor={"pointer"}
        _hover={{ borderColor: "brand.dark" }}
        rounded={"md"}
      >
        <Text>{month}/</Text>
        <Text>{day}/</Text>
        <Text>{year}</Text>
        <Icon as={IoCalendarOutline} w={4} h={4} ml={2} />
      </Flex>
    );
  };

  useEffect(() => {
    const newHighlightedDates = impactfulRevisions.reduce(
      (acc: any, revision: any) => {
        if (revision.probability !== 1) {
          const newDate = new Date(
            revision.date.year,
            revision.date.month - 1,
            revision.date.day
          );
          acc.push(newDate);
        }
        return acc;
      },
      []
    ); // Start with an empty array

    setHighlightedDates(newHighlightedDates);
  }, [impactfulRevisions]);

  // useEffect(() => {
  //   console.log("impactfulRevisions", impactfulRevisions);
  //   console.log("highlightedDates", highlightedDates);
  // }, [highlightedDates]);

  return (
    <Flex alignItems={"center"}>
      <Flex mr={"1"}>
        <Text fontSize={"xs"} fontWeight={"bold"}>
          Impactful Events:
        </Text>
      </Flex>
      <Flex direction={"column"} position={"relative"} fontSize={"xs"}>
        {dateWindow(selectedMonth, selectedYear, selectedDay)}
        {openCalendar && (
          <Flex
            direction={"column"}
            bg={"white"}
            shadow={"lg"}
            h={"250px"}
            p={2}
            justifyContent={"center"}
            zIndex={1000}
            top={"45px"}
            position={"absolute"}
            border={"1px"}
            borderColor={"brand.light"}
            rounded={"md"}
            // w={"350px"}
          >
            <Flex
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              px={6}
              mb={"4"}
            >
              <IoChevronBack onClick={handleBackwardClick} />
              <Flex>
                {monthSelector(months)}
                {yearSelector(currentYear)}
              </Flex>
              <IoChevronForward onClick={handleForwardClick} />
            </Flex>
            <Grid
              templateColumns="repeat(7, 1fr)"
              templateRows="repeat(6, 1fr)"
              maxH={"300px"}
            >
              {weekDays.map((day, index) => (
                <GridItem key={index} colSpan={1} rowSpan={1} w={"50px"}>
                  <Flex justifyContent={"center"} alignItems={"center"}>
                    <Text fontWeight={"bold"}>{day}</Text>
                  </Flex>
                </GridItem>
              ))}
              {days}
            </Grid>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default CustomDatePicker;
