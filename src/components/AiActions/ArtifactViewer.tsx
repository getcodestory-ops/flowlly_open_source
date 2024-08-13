import { Flex, Icon } from "@chakra-ui/react";

import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { get_task_result } from "@/api/taskQueue";
import CountdownTimer from "./ArtifactQueueTimeCounter";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { FaRegDotCircle } from "react-icons/fa";
import ActionItemViewer from "./ActionItemViewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StreamingResponse from "../Notifications/StreamWebResponse";

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
    stream?: string;
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
          <div className="flex flex-col">
            <MarkDownDisplay content={results.results ?? ""} />
            {results.stream && <StreamingResponse />}
          </div>
        </Flex>
      );

    case "log_action_items":
    case "schedule_addition":
    case "schedule_removal":
    case "schedule_update":
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
              <div className="ml-2 border-l-2">
                <ArtifactViewer
                  childTaskId={results.child_task.child_task_id}
                  projectId={projectId}
                  sessionToken={sessionToken}
                />
              </div>
            </div>
          )}
        </>
      );

    case "log_daily" || "log_safety":
      return (
        <div className="p-8">
          {results.results?.content && (
            <MarkDownDisplay content={results.results.content} />
          )}
        </div>
      );

    default:
      return <Flex>{task_function}</Flex>;
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
    // refetchInterval: 5000,
  });

  return (
    <div className="ml-2 flex">
      {task_result &&
        task_result.run_config &&
        task_result.task_results.length === 0 && (
          <CountdownTimer runConfig={task_result.run_config} />
        )}
      {task_result &&
        task_result.task_results &&
        task_result.task_results.length > 0 &&
        task_result.task_function && (
          <div className="flex flex-col">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Results </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-2 border-l-2">
                    <TaskResultDisplay
                      task_function={task_result.task_function}
                      results={task_result.task_results[0].results}
                      chidlTaskId={childTaskId}
                      projectId={projectId}
                      sessionToken={sessionToken}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
    </div>
  );
}
export default ArtifactViewer;
