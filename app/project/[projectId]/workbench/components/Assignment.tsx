"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getProjectEvents } from "@/api/taskQueue";
import { useStore } from "@/utils/store";
import { GraphList } from "./GraphList";
import { EventScheduleList } from "./EventScheduleList";
import { ResultViewer } from "./ResultViewer";
import type {
  NodeData,
  GraphData,
  EventResult,
  EventSchedule,
  ProjectEvents,
} from "./types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TriggerUI } from "./TriggerUI";

const Breadcrumbs: React.FC<{
  currentGraph: GraphData | null;
  onBackToList: () => void;
}> = ({ currentGraph, onBackToList }) => (
  <nav className="flex mb-4" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      <li className="inline-flex items-center">
        <Button
          variant="link"
          onClick={onBackToList}
          className="text-sm font-medium text-black hover:text-blue-600"
        >
          Ai jobs
        </Button>
      </li>
      {currentGraph && (
        <li>
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
              {currentGraph.name}
            </span>
          </div>
        </li>
      )}
    </ol>
  </nav>
);

//
export default function AssignmentHome() {
  const [currentGraphId, setCurrentGraphId] = useState<string | null>(null);
  const [eventSchedule, setEventSchedule] = useState<EventSchedule[] | null>(
    null
  );
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [currentResult, setCurrentResult] = useState<EventResult | null>(null);
  const [graphs, setGraphs] = useState<GraphData[] | null>(null);
  const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  const session = useStore((state) => state.session);
  const activeProject = useStore((state) => state.activeProject);

  const { data } = useQuery({
    queryKey: ["projectEvents"],
    queryFn: () => {
      if (!session || !activeProject) return [];
      return getProjectEvents({
        session: session,
        projectId: activeProject.project_id,
      });
    },
    enabled: !!session && !!activeProject,
  });

  useEffect(() => {
    if (data) {
      setGraphs(data.map((d: ProjectEvents) => d.project_events));
    }
  }, [data]);

  useEffect(() => {
    if (graphs) {
      const graph = graphs?.find((g) => g.id === currentGraphId);
      setCurrentGraph(graph || null);
      setEventSchedule(graph?.event_schedule || null);
    } else {
      setEventSchedule(null);
      setCurrentGraph(null);
      setCurrentResult(null);
    }
  }, [currentGraphId, graphs]);

  const handleSelectNode = (node: NodeData) => {
    setSelectedNode(node);
  };

  if (!graphs) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" mx-auto p-4 h-[calc(100vh-150px)]">
      <Breadcrumbs
        currentGraph={currentGraph}
        onBackToList={() => {
          setCurrentGraphId(null);
          setCurrentResult(null);
        }}
      />

      {!currentGraph && (
        <Card className="p-6">
          <GraphList graphs={graphs} onSelectGraph={setCurrentGraphId} />
        </Card>
      )}

      {eventSchedule && (
        <div className={`${currentResult ? "grid grid-cols-12  h-full" : ""}`}>
          <div
            className={`p-6 ${
              currentResult
                ? "col-span-3 h-full overflow-y-auto border-r-2 border-gray-200"
                : ""
            }`}
          >
            <Tabs defaultValue="schedules">
              <TabsList className="mb-4">
                <TabsTrigger value="schedules">Runs</TabsTrigger>
                {currentGraph?.event_trigger &&
                  currentGraph?.event_trigger.length > 0 &&
                  currentGraph?.event_trigger[0].trigger_by === "ui" && (
                    <TabsTrigger value="trigger">Start Workflow</TabsTrigger>
                  )}
              </TabsList>

              <TabsContent value="schedules" className="h-full">
                <EventScheduleList
                  graphs={eventSchedule || []}
                  onSelectGraph={setCurrentResult}
                  eventId={currentGraphId || ""}
                  setIsLoadingResult={setIsLoadingResult}
                />
              </TabsContent>

              {currentGraph?.event_trigger &&
                currentGraph?.event_trigger.length > 0 &&
                currentGraph?.event_trigger[0].trigger_by === "ui" && (
                  <TabsContent value="trigger">
                    <TriggerUI
                      eventId={currentGraphId || ""}
                      onTrigger={setCurrentResult}
                    />
                  </TabsContent>
                )}
            </Tabs>
          </div>

          {currentResult && (
            <div className="col-span-9 h-full ">
              <div className="p-6 h-full overflow-y-auto">
                {!currentResult.nodes || isLoadingResult ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-2 border-t-gray-900"></div>
                  </div>
                ) : (
                  <ResultViewer
                    currentResult={currentResult}
                    selectedNode={selectedNode}
                    onSelectNode={handleSelectNode}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
