import React, { useEffect } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import RSSCard from "./RSSCard";
import timeSinceLatestSignificantEvent from "../../utils/timeSinceLatestSignificantEvent";

function RisksRSSsection() {
  const { userActivities } = useStore((state) => ({
    userActivities: state.userActivities,
  }));

  useEffect(() => {
    // console.log("user activities", userActivities);
  }, [userActivities]);

  return (
    <Flex w={"full"} direction={"column"}>
      <Text fontSize={"14px"} fontWeight={"bold"} mb={"2"}>
        Identified Risks
      </Text>
      <Flex direction={"column"}>
        {userActivities &&
          userActivities
            // First, filter out the activities that are either "Delayed" or "At Risk"
            .filter(
              (activity) =>
                activity.status === "Delayed" || activity.status === "At Risk"
            )
            // Then, sort them so that "Delayed" activities come first
            .sort((a, b) => {
              if (a.status === "Delayed" && b.status !== "Delayed") {
                return -1; // Place 'a' before 'b'
              }
              if (a.status !== "Delayed" && b.status === "Delayed") {
                return 1; // Place 'b' before 'a'
              }
              return 0; // Keep original order in case of a tie
            })
            // Finally, map each activity to the RSSCard component
            .map((activity, index) => (
              <RSSCard
                title={activity.name}
                date={timeSinceLatestSignificantEvent(activity)}
                status={activity.status}
                key={index}
                index={index}
                explanation={
                  activity.revision?.[0]?.name ?? "No explanation provided"
                }
                severity={
                  activity.history?.[0]?.severity ?? "defaultSeverityValue"
                }
                source="risk"
              />
            ))}
      </Flex>
    </Flex>
  );
}

export default RisksRSSsection;
