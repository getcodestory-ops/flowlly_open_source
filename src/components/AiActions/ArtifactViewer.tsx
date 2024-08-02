import { Flex, Icon } from "@chakra-ui/react";
import { Antartifact } from "@/types/agentChats";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import MinutesMeetingArtifact from "./MinutesMeetingArtifact";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { get_task_result } from "@/api/taskQueue";
import CountdownTimer from "./ArtifactQueueTimeCounter";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { FaRegDotCircle } from "react-icons/fa";
import ActionItemViewer from "./ActionItemViewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function TaskResultDisplay({
  task_function,
  results,
  chidlTaskId,
  projectId,
  sessionToken,
}: {
  task_function: string;
  results: {
    results?: string | any;
    minutes_of_the_meeting?: string;
    child_task?: {
      message: string;
      child_task_id: string;
    };
  };
  chidlTaskId: string;
  projectId: string;
  sessionToken: Session;
}) {
  switch (task_function) {
    case "invoke_reference":
      return (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          gap="4"
          p="2"
          borderRadius={"lg"}
        >
          <Icon as={FaRegDotCircle} fontSize={"sm"} color="green.400" />
          <MarkDownDisplay content={results.results ?? ""} />
        </Flex>
      );

    case "log_action_items":
      return (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          gap="4"
          p="2"
          borderRadius={"lg"}
        >
          {/* <Icon as={FaRegDotCircle} fontSize={"sm"} color="green.400" /> */}
          <ActionItemViewer results={results.results ?? []} />
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
          {/* <ActionItemViewer results={results.results ?? []} /> */}
        </Flex>
      );

    case "log_minutes":
      return (
        <>
          <ContentEditor content={results.minutes_of_the_meeting ?? ""} />
          {results.child_task && (
            <div className="mt-16">
              <Alert>
                <FaRegDotCircle />
                <AlertTitle>Next task up!</AlertTitle>
                <AlertDescription className="font-normal">
                  {results.child_task.message}
                </AlertDescription>
              </Alert>

              <ArtifactViewer
                childTaskId={results.child_task.child_task_id}
                projectId={projectId}
                sessionToken={sessionToken}
              />
            </div>
          )}
        </>
      );

    default:
      return <Flex>{JSON.stringify(results)}</Flex>;
  }
}

function ArtifactViewer({
  childTaskId,
  projectId,
  sessionToken,
}: {
  childTaskId: string;
  projectId: string;
  sessionToken: Session;
}) {
  const tags = [
    "schedule_update",
    "schedule_addition",
    "schedule_removal",
    "invoke_reference",
    "log_safety",
    "log_minutes",
    "log_daily",
    "log_action_items",
  ];

  const { data: task_result } = useQuery({
    queryKey: ["task_result", childTaskId, projectId, sessionToken],
    queryFn: () => get_task_result(sessionToken, childTaskId, projectId),
    enabled: !!childTaskId && !!sessionToken,
  });

  return (
    <Flex ml="2">
      {task_result &&
        task_result.task_results &&
        task_result.task_results.length &&
        task_result.task_function && (
          <Flex flexDir="column">
            {task_result.run_config && !task_result.task_results && (
              <CountdownTimer runConfig={task_result.run_config} />
            )}

            <TaskResultDisplay
              task_function={task_result.task_function}
              results={task_result.task_results[0].results}
              chidlTaskId={childTaskId}
              projectId={projectId}
              sessionToken={sessionToken}
            />
          </Flex>
        )}
    </Flex>
  );
}
export default ArtifactViewer;
