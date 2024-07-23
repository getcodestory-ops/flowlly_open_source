import { Flex } from "@chakra-ui/react";
import { Antartifact } from "@/types/agentChats";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import MinutesMeetingArtifact from "./MinutesMeetingArtifact";
import { Session } from "@supabase/supabase-js";

function ArtifactViewer({
  antartifact,
  sessionToken,
}: {
  antartifact: Antartifact;
  sessionToken?: Session | null;
}) {
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
        >
          {antartifact.result ? (
            <>
              <MarkDownDisplay content={antartifact.result} />
            </>
          ) : (
            <>
              <Flex>Searching through documents...</Flex>
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
        <>
          <MinutesMeetingArtifact
            antartifact={antartifact}
            sessionToken={sessionToken}
          />
        </>
      );

    default:
      return <Flex>Viewer</Flex>;
  }
}
export default ArtifactViewer;
