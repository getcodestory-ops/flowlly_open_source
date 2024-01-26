import React from "react";
import { Stack } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import GraphCard, { GraphCardProps } from "./GraphCard";

function GraphSection() {
  const options = {
    chart: {
      id: "apexchart-example",
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: [
        "J-23",
        "F-23",
        "M-23",
        "A-23",
        "M-23",
        "J-23",
        "J-23",
        "A-23",
        "S-23",
        "O-23",
        "N-23",
        "D-23",
        "J-24",
        "F-24",
      ],
    },
    forecastDataPoints: {
      count: 7,
    },
    tickAmount: 6,
  };

  const series = [
    {
      name: "Expected",
      data: [
        8.3, 16.6, 24.9, 33.2, 41.5, 49.8, 58.1, 66.4, 74.7, 83, 91.3, 100,
      ],
    },
    {
      name: "Actual",
      data: [5, 10, 24, 30, 37, 40, 55, 60, 65, 72, 85, 93, 100],
    },
  ];

  const duration = {
    chart: {
      id: "apexchart-example",
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: [
        "J-23",
        "F-23",
        "M-23",
        "A-23",
        "M-23",
        "J-23",
        "J-23",
        "A-23",
        "S-23",
        "O-23",
        "N-23",
        "D-23",
      ],
    },
    forecastDataPoints: {
      count: 7,
    },
  };

  const duratiionSeries = [
    {
      name: "Original Estimation",
      data: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
    },
    {
      name: "Current Estimation",
      data: [300, 310, 300, 290, 340, 340, 340, 340, 340, 340, 340, 340],
    },
  ];

  const activities = {
    chart: {
      id: "apexchart-example",
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: [
        "J-23",
        "F-23",
        "M-23",
        "A-23",
        "M-23",
        "J-23",
        "J-23",
        "A-23",
        "S-23",
        "O-23",
        "N-23",
        "D-23",
      ],
    },
    forecastDataPoints: {
      count: 5,
    },
    colors: ["#FF0000", "#FFA500"],
  };

  const activitiesSeries = [
    {
      name: "Delayed Tasks",
      data: [0, 0, 0, 3, 0, 10, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "At Risk Tasks",
      data: [0, 0, 0, 8, 2, 5, 0, 0, 0, 0, 0, 0],
    },
  ];

  const safetyReports = {
    chart: {
      id: "apexchart-example",
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: [
        "J-23",
        "F-23",
        "M-23",
        "A-23",
        "M-23",
        "J-23",
        "J-23",
        "A-23",
        "S-23",
        "O-23",
        "N-23",
        "D-23",
      ],
    },
    forecastDataPoints: {
      count: 5,
    },
    colors: ["#FF0000"],
  };

  const safetyReportsSeries = [
    {
      name: "Safety Incidents",
      data: [0, 10, 0, 5, 7, 13, 0, 0, 0, 0, 0, 0],
    },
  ];

  const data: GraphCardProps[] = [
    {
      options: options,
      series: series,
      type: "line",
      title: "Project Progress",
      actualValue: "40%",
      valueChange: "10%",
      changeType: "down",
      changeImpact: "negative",
    },
    {
      options: duration,
      series: duratiionSeries,
      type: "line",
      title: "Duration",
      actualValue: "340 days",
      valueChange: "40 days",
      changeType: "up",
      changeImpact: "negative",
    },
    {
      options: activities,
      series: activitiesSeries,
      type: "line",
      title: "Delay and At Risk Tasks",
      changeType: "up",
      changeImpact: "negative",
    },
    {
      options: safetyReports,
      series: safetyReportsSeries,
      type: "line",
      title: "Safety Incidents",
      actualValue: "13 incidents",
      valueChange: "6 incidents",
      changeType: "up",
      changeImpact: "negative",
    },
  ];

  return (
    <Stack spacing={2}>
      {data.map((item, index) => (
        <GraphCard {...item} key={index} />
      ))}
    </Stack>
  );
}

export default GraphSection;
