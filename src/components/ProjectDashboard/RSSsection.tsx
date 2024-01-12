import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import RSSCard from "./RSSCard";

function RSSsection() {
  const { userActivities } = useStore((state) => ({
    userActivities: state.userActivities,
  }));

  function timeSinceLatestSignificantEvent(activity: any) {
    let significantEvents = activity.history.filter(
      (e: any) => e.severity === "severe"
    );

    if (significantEvents.length === 0) {
      significantEvents = activity.history.filter(
        (e: any) => e.severity === "moderate"
      );
    }

    if (significantEvents.length === 0) {
      return "No severe or moderate events found";
    }

    significantEvents.sort(
      (a: any, b: any) =>
        (new Date(b.created_at) as any) - (new Date(a.created_at) as any)
    );

    const latestEvent = new Date(significantEvents[0].created_at);
    const now = new Date();
    const timeDiff = (now as any) - (latestEvent as any); // Difference in milliseconds

    const hours = timeDiff / 1000 / 60 / 60;
    const days = hours / 24;
    const weeks = days / 7;
    const months = days / 30;
    const years = days / 365;

    if (hours < 24) {
      return `${Math.floor(hours)} hrs ago`;
    } else if (days < 7) {
      return `${Math.floor(days)} days ago`;
    } else if (weeks < 4) {
      return `${Math.floor(weeks)} weeks ago`;
    } else if (months < 12) {
      return `${Math.floor(months)} months ago`;
    } else {
      return years <= 1 ? "1 year ago" : "more than one year ago";
    }
  }

  return (
    <Flex w={"full"} pr={"4"} direction={"column"} overflowY={"auto"}>
      <Text fontSize={"sm"} fontWeight={"bold"} mb={"3"}>
        Activity Updates
      </Text>
      <Flex direction={"column"}>
        {userActivities &&
          userActivities
            .filter(
              (activity) =>
                activity.status === "Delayed" || activity.status === "At Risk"
            )
            .map((activity, index) => (
              <RSSCard
                title={activity.name}
                date={timeSinceLatestSignificantEvent(activity)}
                status={activity.status}
                key={index}
              />
            ))}
      </Flex>
    </Flex>
  );
}

export default RSSsection;
