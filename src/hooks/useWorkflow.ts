import { EventSchedule, EventResult, GraphData, ViewMode } from "@/components/WorkflowComponents/types";
import { create } from "zustand";

interface WorkflowStore {
  currentGraphId: string | null;
  setCurrentGraphId: (_: string | null) => void;
  eventSchedule: EventSchedule[] | null;
  setEventSchedule: (_: EventSchedule[] | null) => void;
  currentResult: EventResult | null;
  setCurrentResult: (_: EventResult | null) => void;
  graphs: GraphData[] | null;
  setGraphs: (_: GraphData[] | null) => void;
  isLoadingResult: boolean;
  setIsLoadingResult: (_: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (_: ViewMode) => void;
}

export const useWorkflow = create<WorkflowStore>((set) => ({
	currentGraphId: null,
	setCurrentGraphId: (currentGraphId: string | null) => set({ currentGraphId }),
	eventSchedule: null,
	setEventSchedule: (eventSchedule: EventSchedule[] | null) => set({ eventSchedule }),
	currentResult: null,
	setCurrentResult: (currentResult: EventResult | null) => set({ currentResult }),
	graphs: null,
	setGraphs: (graphs: GraphData[] | null) => set({ graphs }),
	isLoadingResult: false,
	setIsLoadingResult: (isLoadingResult: boolean) => set({ isLoadingResult }),
	viewMode: ViewMode.GRID,
	setViewMode: (viewMode: ViewMode) => set({ viewMode }),
}));
