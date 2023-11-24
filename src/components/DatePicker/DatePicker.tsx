import React, { useState, useEffect } from "react";
import { Flex, Text, Grid, GridItem, Select, Icon } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActivities } from "@/api/activity_routes";
import getCurrentDateFormatted from "@/utils/getCurrentDateFormatted";
import { IoCalendarOutline } from "react-icons/io5";

interface ActivityRevision {
  name: string;
  date: {
    year: number;
    month: number;
    day: number;
  };
  probability: number;
}

function CustomDatePicker() {
  const { session, activeProject, setTaskToView, setRightPanelView } = useStore(
    (state) => ({
      session: state.session,
      activeProject: state.activeProject,
      setTaskToView: state.setTaskToView,
      setRightPanelView: state.setRightPanelView,
    })
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [probability, setProbability] = useState<number>(0.5);
  const [impactfulRevisions, setImpactfulRevisions] = useState([]);

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

  const {
    data: activities,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["activityList", session, activeProject, startDate, probability],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }
      const date = getCurrentDateFormatted(startDate || new Date());
      return getActivities(
        session,
        activeProject.project_id,
        date,
        probability
      );
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  const [highlightedDates, setHighlightedDates] = useState([
    new Date(2023, 2, 20), // March 20, 2023
    new Date(2023, 2, 31), // March 31, 2023
    new Date(2023, 3, 5), // April 5, 2023
  ]);

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
      (date) =>
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
        bg={isHighlighted ? "brand.dark" : ""}
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
        alignItems={"center"}
        p={"2"}
        border={"1px"}
        borderColor={"gray.200"}
        w={"120px"}
        justifyContent={"center"}
        onClick={() => setOpenCalendar((state) => !state)}
        cursor={"pointer"}
        _hover={{ borderColor: "brand.dark" }}
        rounded={"md"}
      >
        <Text fontSize={"sm"}>{month}/</Text>
        <Text fontSize={"sm"}>{day}/</Text>
        <Text fontSize={"sm"}>{year}</Text>
        <Icon as={IoCalendarOutline} w={4} h={4} ml={2} />
      </Flex>
    );
  };

  useEffect(() => {
    console.log("activities", activities);
    if (activities) {
      const newRevisions = activities.map((activity) => ({
        name: activity.name,
        date: parseDate(activity.revision[0].created_at),
        probability: activity.revision[0].probability,
      }));
      setImpactfulRevisions(newRevisions);
    }
  }, [activities]);

  useEffect(() => {
    const newHighlightedDates = impactfulRevisions.reduce(
      (acc, revision) => {
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
      [...highlightedDates]
    ); // Spread to create a new array, don't mutate the original

    setHighlightedDates(newHighlightedDates);
  }, [impactfulRevisions]);

  useEffect(() => {
    console.log("impactfulRevisions", impactfulRevisions);
    console.log("highlightedDates", highlightedDates);
  }, [highlightedDates]);

  return (
    <Flex direction={"column"}>
      {dateWindow(selectedMonth, selectedYear, selectedDay)}
      {openCalendar && (
        <Flex
          direction={"column"}
          bg={"white"}
          shadow={"lg"}
          h={"250px"}
          p={2}
          justifyContent={"center"}
          fontSize={"sm"}
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
  );
}

export default CustomDatePicker;
