import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import RSSCard from "./RSSCard";
import { convertDateToTimeText } from "../../utils/timeSinceLatestSignificantEvent";

function UpdatesRSSsection() {
  const updateActivities = [
    {
      title: "Delivery of materials delayed",
      created_at: "2023-12-01 14:35",
      message:
        "The delivery of materials has been delayed by 2 weeks due to a shortage of raw materials.",
      type: "email",
    },
    {
      title: "We are done with the foundation",
      created_at: "2023-12-01 14:35",
      message: "We are done with the foundation",
      type: "task",
    },
    {
      title: "RFI: Required materials?",
      created_at: "2023-12-01 14:35",
      message:
        "What are the required materials for the office in the 3rd floow?",
      type: "rfi",
    },
    {
      title: "Quality issues",
      created_at: "2023-12-01 14:35",
      message: "There are quality issues with the materials delivered",
      type: "quality",
    },
    {
      title: "Meeting 12-09-23",
      created_at: "2023-12-01 14:35",
      message: "Transcript for meeting 12-09-23 created",
      type: "meeting",
    },
  ];

  return (
    <Flex w={"full"} direction={"column"} overflowY={"auto"}>
      <Text fontSize={"14px"} fontWeight={"bold"} mb={"2"}>
        Updates
      </Text>
      <Flex direction={"column"}>
        {updateActivities &&
          updateActivities
            .reverse()
            .map((activity, index) => (
              <RSSCard
                title={activity.title}
                date={convertDateToTimeText(activity.created_at)}
                explanation={activity.message}
                type={activity.type}
                key={index}
                source="update"
              />
            ))}
      </Flex>
    </Flex>
  );
}

export default UpdatesRSSsection;
