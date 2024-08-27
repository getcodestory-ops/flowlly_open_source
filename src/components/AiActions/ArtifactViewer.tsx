import { Flex, Icon } from "@chakra-ui/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { getTaskResult } from "@/api/taskQueue";
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
import StreamComponent from "@/components/StreamResponse/StreamAgentChat";
import { useReRunAction } from "./useReRunAction";

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

          <div
            className="flex flex-col"
            // key={results.results.slice(0, 5) ?? ""}
          >
            {typeof results.results === "string" ? (
              <div>
                <MarkDownDisplay content={results.results} />
              </div>
            ) : (
              <div>
                {results.results?.result && (
                  <MarkDownDisplay content={results.results.result} />
                )}
              </div>
            )}
            {/* <MarkDownDisplay content={results.results ?? ""} /> */}

            {results.stream && sessionToken && (
              <StreamComponent
                streamingKey={results.stream}
                authToken={sessionToken.access_token}
                taskId={chidlTaskId}
              />
            )}
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

    case "log_daily":
    case "log_safety":
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

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

const availableActions = [
  {
    value: "log_minutes",
    label: "Write Minutes",
  },
  {
    value: "log_safety",
    label: "Write safety report",
  },
  {
    value: "log_daily",
    label: "Note update in daily log",
  },
  {
    value: "schedule_update",
    label: "Update schedule",
  },
  {
    value: "invoke_reference",
    label: "Search project documents",
  },
];

export function ReRunChatAction({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { reRun } = useReRunAction(id);

  return (
    <div className="flex gap-4 mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
          >
            {value
              ? availableActions.find((framework) => framework.value === value)
                  ?.label
              : "Select a different action..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Search available actions..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No action found.</CommandEmpty>
              <CommandGroup>
                {availableActions.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button className="ml-2" size="sm" onClick={() => reRun(value)}>
        Re-run
      </Button>
    </div>
  );
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
    queryKey: [
      `taskResult${childTaskId}`,
      childTaskId,
      projectId,
      sessionToken,
    ],
    queryFn: () => getTaskResult(sessionToken, childTaskId, projectId),
    enabled: !!childTaskId && !!sessionToken,
    // refetchInterval: 5000,
  });

  return (
    <div className="ml-2 flex flex-col">
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
                    {task_result.task_results.map((task_output: any) => (
                      <>
                        {task_output.results && (
                          <div className="border-b-2">
                            <TaskResultDisplay
                              task_function={task_result.task_function}
                              results={task_output.results}
                              chidlTaskId={childTaskId}
                              projectId={projectId}
                              sessionToken={sessionToken}
                            />
                          </div>
                        )}
                      </>
                    ))}
                    <div className="ml-2">
                      <ReRunChatAction id={childTaskId} />
                    </div>
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
