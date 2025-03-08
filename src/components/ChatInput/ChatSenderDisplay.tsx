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
			<Icon
				as={icon}
				color="green.500"
				fontWeight="bold"
			/>
			<Text as="b" mx="2">
				{sender}
			</Text>
		</Flex>
	);
}

function ChatSenderDisplay({ sender }: { sender: string }) {
	switch (sender) {
		case "user":
			return (
				<SenderWithIcon icon={IoChatbubbleEllipsesOutline} sender="User" />
			);
		case "Flowlly-analyzer":
			return <SenderWithIcon icon={LuBrain} sender="Scheduler" />;
		case "user":
			return (
				<SenderWithIcon icon={IoChatbubbleEllipsesOutline} sender="User" />
			);
		case "Flowlly-reviewer":
			return <SenderWithIcon icon={MdOutlineRateReview} sender="Reviewer" />;
		case "Flowlly-schedule-additions":
			return <SenderWithIcon icon={FaList} sender="Schedule Additions" />;
		case "Flowlly-schedule-update":
			return <SenderWithIcon icon={FaList} sender="Schedule Changes" />;
		case "Flowlly-schedule-removal":
			return <SenderWithIcon icon={FaList} sender="Schedule Ommissions" />;
		default:
			return (
				<SenderWithIcon icon={IoChatbubbleEllipsesOutline} sender={sender} />
			);
	}
}

export default ChatSenderDisplay;
