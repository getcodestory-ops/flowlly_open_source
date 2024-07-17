import React from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { LuBrain } from "react-icons/lu";

import { FaList } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";

import { IconType } from "react-icons";

function SenderWithIcon({ sender, icon }: { sender: string; icon: IconType }) {
  return (
    <Flex alignItems="center">
      <Icon as={icon} color="green.500" fontWeight={"bold"} />
      <Text mx="2" as="b">
        {sender}
      </Text>
    </Flex>
  );
}

function ChatSenderDisplay({ sender }: { sender: string }) {
  switch (sender) {
    case "user":
      return (
        <SenderWithIcon sender="User" icon={IoChatbubbleEllipsesOutline} />
      );
    case "Flowlly-analyzer":
      return <SenderWithIcon sender="Scheduler" icon={LuBrain} />;
    case "user":
      return (
        <SenderWithIcon sender="User" icon={IoChatbubbleEllipsesOutline} />
      );
    case "Flowlly-reviewer":
      return <SenderWithIcon sender="Reviewer" icon={MdOutlineRateReview} />;
    case "Flowlly-schedule-additions":
      return <SenderWithIcon sender="Schedule Additions" icon={FaList} />;
    case "Flowlly-schedule-update":
      return <SenderWithIcon sender="Schedule Changes" icon={FaList} />;
    case "Flowlly-schedule-removal":
      return <SenderWithIcon sender="Schedule Ommissions" icon={FaList} />;
    default:
      return (
        <SenderWithIcon sender={sender} icon={IoChatbubbleEllipsesOutline} />
      );
  }
}

export default ChatSenderDisplay;
