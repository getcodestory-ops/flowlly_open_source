"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [currentResult, setCurrentResult] = useState<EventResult | null>(null);
  const [graphs, setGraphs] = useState<GraphData[] | null>(null);
  const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
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
    setSheetOpen(false);
  }, [currentGraphId, graphs]);

  useEffect(() => {
    if (currentResult) setSheetOpen(true);
  }, [currentResult]);

  useEffect(() => {
    if (!sheetOpen) setCurrentResult(null);
  }, [sheetOpen]);

  const handleSelectNode = (node: NodeData) => {
    setSelectedNode(node);
  };

  if (!graphs) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4  border-t border-black ">
      <Breadcrumbs
        currentGraph={currentGraph}
        onBackToList={() => setCurrentGraphId(null)}
      />

      <div
        className={`fixed flex  z-10 right-1 lg:w-full  h-full top-0   transform transition-transform duration-300 ease-in-out border rounded-lg justify-center items-center ${
          sheetOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          onClick={() => setSheetOpen(false)}
          className="w-full h-full bg-black opacity-70 absolute top-0 left-0  "
        ></div>
        <div className="container z-10 bg-white rounded-lg lg:h-[90%] m-10 h-min py-4 overflow-y-auto ">
          {/* <div className="container z-10 bg-gradient-to-b from-purple-400 to-blue-600 rounded-lg lg:h-[90%] m-10 h-min overflow-y-auto "> */}
          {/* <div className="fixed  translate-y-8  ">
            <Button
              onClick={() => setSheetOpen(false)}
              className="text-gray-500 m-4"
            >
              <X size={24} />
            </Button>
          </div> */}
          {currentGraph && currentResult && (
            <div className="h-full">
              {!currentResult.nodes ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <ResultViewer
                  currentResult={currentResult}
                  selectedNode={selectedNode}
                  onSelectNode={handleSelectNode}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {!currentGraph && (
        <Card className="p-6">
          <GraphList graphs={graphs} onSelectGraph={setCurrentGraphId} />
        </Card>
      )}

      {eventSchedule && (
        <Card className="p-6">
          <EventScheduleList
            graphs={eventSchedule || []}
            onSelectGraph={setCurrentResult}
          />
        </Card>
      )}
    </div>
  );
}
