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
  const [activeTab, setActiveTab] = useState<string>("schedules");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

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
    <div className=" mx-auto p-4 h-[calc(100vh-150px)] ">
      {!currentGraph && (
        <Card className="p-6">
          <GraphList graphs={graphs} onSelectGraph={setCurrentGraphId} />
        </Card>
      )}

      {eventSchedule && (
        <div className={`${currentResult ? "grid grid-cols-12 h-full" : ""}`}>
          <div
            className={`p-6 transition-all duration-300 ${
              currentResult
                ? `${
                    isPanelCollapsed
                      ? "col-span-1 w-12 min-w-12 p-0"
                      : "col-span-3"
                  } overflow-hidden border-r border-gray-200 relative`
                : ""
            }`}
          >
            {currentResult && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="absolute -right-2 top-2 z-10 bg-white border shadow-sm"
              >
                {isPanelCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Button>
            )}

            <div className={`${isPanelCollapsed ? "invisible" : "visible"}`}>
              <Breadcrumbs
                currentGraph={currentGraph}
                onBackToList={() => {
                  setCurrentGraphId(null);
                  setCurrentResult(null);
                }}
              />
              <Tabs
                defaultValue="schedules"
                value={activeTab}
                onValueChange={setActiveTab}
              >
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
                        setTab={setActiveTab}
                      />
                    </TabsContent>
                  )}
              </Tabs>
            </div>
          </div>

          {currentResult && (
            <div
              className={`${
                isPanelCollapsed ? "col-span-11" : "col-span-9"
              } h-full`}
            >
              <div
                className={`${
                  isPanelCollapsed ? "p-2" : "p-6"
                } h-full overflow-y-auto`}
              >
                {!currentResult.nodes || isLoadingResult ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="relative w-32 h-32">
                      {/* DNA Helix effect */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full h-1 left-0"
                          style={{
                            top: `${i * 4}px`,
                            transform: `rotate(${i * 45}deg)`,
                            animation: `wave 2s ease-in-out ${
                              i * 0.1
                            }s infinite`,
                            background: `linear-gradient(90deg, 
                                 transparent 0%, 
                                 rgba(59, 130, 246, 0.8) 20%, 
                                 rgba(147, 51, 234, 0.8) 50%, 
                                 rgba(236, 72, 153, 0.8) 80%, 
                                 transparent 100%)`,
                          }}
                        ></div>
                      ))}

                      {/* Circular Energy field */}
                      <div className="absolute -mt-16 inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-500/20 to-transparent animate-pulse"></div>
                      <div className="absolute -mt-16 inset-0 rounded-full border-2 border-purple-500/20 animate-[ping_3s_ease-in-out_infinite]"></div>

                      {/* Data streams */}
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
                          style={{
                            left: `${25 + i * 16}%`,
                            animation: `dataStream 1.5s linear ${
                              i * 0.2
                            }s infinite`,
                          }}
                        ></div>
                      ))}
                    </div>
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
