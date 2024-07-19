import { Flex } from "@chakra-ui/react";
import React from "react";
import { Antartifact } from "@/types/agentChats";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";

function ArtifactViewer({ antartifact }: { antartifact: Antartifact }) {
  const tags = [
    "schedule_update",
    "schedule_addition",
    "schedule_removal",
    "invoke_reference",
    "log_safety",
    "log_minutes",
    "log_daily",
  ];

  switch (antartifact.attributes?.type) {
    case "invoke_reference":
      return (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          gap="4"
          p="2"
          borderRadius={"lg"}
          bg="brand.light"
        >
          {antartifact.result ? (
            <>
              <MarkDownDisplay content={antartifact.result} />
            </>
          ) : (
            <>
              {" "}
              <Flex>Searching...</Flex>
              <Flex
                justifyContent={"center"}
                alignItems={"center"}
                animation={`spin infinite 2s linear`}
                css={{
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <AiOutlineLoading3Quarters />
              </Flex>
            </>
          )}
        </Flex>
      );

    case "schedule_update":
      return (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          gap="4"
          p="2"
          borderRadius={"lg"}
        >
          <Flex>Your schedule interaction...</Flex>
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            animation={`spin infinite 2s linear`}
            css={{
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <AiOutlineLoading3Quarters />
          </Flex>
        </Flex>
      );

    case "log_minutes":
      return (
        <Flex
          flexDir="column"
          justifyContent={"center"}
          alignItems={"center"}
          gap="4"
          p="2"
          borderRadius={"lg"}
        >
          <Flex>
            Writing minutes of meeting ...{" "}
            <Flex
              justifyContent={"center"}
              alignItems={"center"}
              animation={`spin infinite 2s linear`}
              css={{
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              <AiOutlineLoading3Quarters />
            </Flex>
          </Flex>
          {antartifact.content && (
            <MarkDownDisplay content={antartifact.content} />
          )}
        </Flex>
      );

    default:
      return <Flex>Viewer</Flex>;
  }
}
export default ArtifactViewer;
