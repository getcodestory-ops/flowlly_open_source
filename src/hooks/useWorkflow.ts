import { EventSchedule, EventResult, GraphData, ViewMode, Participant, EventAccessRole } from "@/components/WorkflowComponents/types";
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

  eventParticipants: Participant[] | null;
  setEventParticipants: (_: Participant[] | null) => void;

  currentGraph: GraphData | null;
  setCurrentGraph: (_: GraphData | null) => void;

  isLoadingResult: boolean;
  setIsLoadingResult: (_: boolean) => void;
  
  viewMode: ViewMode;
  setViewMode: (_: ViewMode) => void;

  selectedEventResourceId: string | null;
  setSelectedEventResourceId: (_: string | null) => void;

  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (_: string | null) => void;

  // User roles by event ID
  userRolesByEventId: Record<string, EventAccessRole>;
  setUserRoleForEvent: (eventId: string, role: EventAccessRole) => void;
  clearUserRoleForEvent: (eventId: string) => void;

   // Computed values
   workflowStats: () => { completed: number; running: number; other: number; total: number };
   completedWorkflows: () => EventSchedule[];
   runningWorkflows: () => EventSchedule[];
   
   // User role for current event
   getCurrentUserRole: () => EventAccessRole | null;
   
   // Role utility functions
   isAdmin: () => boolean;
   isOwner: () => boolean;
   isAdminOrOwner: () => boolean;
   canEditSettings: () => boolean;
}

export const useWorkflow = create<WorkflowStore>((set, get) => ({
	currentGraphId: null,
	setCurrentGraphId: (currentGraphId: string | null) => set({ currentGraphId }),

	eventSchedule: null,
	setEventSchedule: (eventSchedule: EventSchedule[] | null) => set({ eventSchedule }),

	currentResult: null,
	setCurrentResult: (currentResult: EventResult | null) => {
		set({ currentResult });
	},

	graphs: null,
	setGraphs: (graphs: GraphData[] | null) => set({ graphs }),

	eventParticipants: null,
	setEventParticipants: (eventParticipants: Participant[] | null) => set({ eventParticipants }),

	currentGraph: null,
	setCurrentGraph: (currentGraph: GraphData | null) => set({ currentGraph }),

	isLoadingResult: false,
	setIsLoadingResult: (isLoadingResult: boolean) => set({ isLoadingResult }),

	viewMode: ViewMode.CALENDAR,
	setViewMode: (viewMode: ViewMode) => set({ viewMode }),

	selectedEventResourceId: null,
	setSelectedEventResourceId: (selectedEventResourceId: string | null ) => set({ selectedEventResourceId }),

	selectedWorkflowId: null,
	setSelectedWorkflowId: (selectedWorkflowId: string | null) => set({ selectedWorkflowId }),

	// User roles by event ID
	userRolesByEventId: {},
	setUserRoleForEvent: (eventId: string, role: EventAccessRole) => set((state) => ({ userRolesByEventId: { ...state.userRolesByEventId, [eventId]: role } })),
	clearUserRoleForEvent: (eventId: string) => set((state) => {
		const newRoles = { ...state.userRolesByEventId };
		delete newRoles[eventId];
		return { userRolesByEventId: newRoles };
	}),

	// Computed workflow statistics
	workflowStats: () => {
		const eventSchedule = get().eventSchedule;
		if (!eventSchedule || eventSchedule.length === 0) {
			return { completed: 0, running: 0, other: 0, total: 0 };
		}

		let completed = 0;
		let running = 0;
		let other = 0;
		let total = 0;

		eventSchedule.forEach((schedule) => {
			schedule.event_result.forEach((result) => {
				total++;

				const isExplicitlyCompleted = !!result;
				const isImplicitlyCompleted =
          (result.status === null || result.status === undefined) &&
          !result.listen &&
          !result.workflow_id;

				const isCompleted = isExplicitlyCompleted || isImplicitlyCompleted;

				const isRunning =
          result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && !isCompleted);

				const isOther = !isCompleted && !isRunning;

				if (isCompleted) completed++;
				if (isRunning) running++;
				if (isOther) other++;
			});
		});

		return { completed, running, other, total };
	},

	// Completed workflows
	completedWorkflows: () => {
		const eventSchedule = get().eventSchedule;
		if (!eventSchedule) return [];

		const completed = eventSchedule.filter((schedule) => {
			const hasCompletedResult = schedule.event_result.some((result) => {
				const isExplicitlyCompleted = !!result;
				const isImplicitlyCompleted =
          (result.status === null || result.status === undefined) &&
          !result.listen &&
          !result.workflow_id;

				return isExplicitlyCompleted || isImplicitlyCompleted;
			});

			const hasRunningResult = schedule.event_result.some(
				(result) =>
					result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && result.status !== "completed"),
			);

			return hasCompletedResult && !hasRunningResult;
		});
		// setSelectedWorkflowId(completed[0].event_result[0].id);
		return completed;
	},

	// Running workflows
	runningWorkflows: () => {
		const eventSchedule = get().eventSchedule;
		if (!eventSchedule) return [];

		return eventSchedule.filter((schedule) =>
			schedule.event_result.some(
				(result) =>
					result.status === "processing" ||
          !!result.listen ||
          (!!result.workflow_id && result.status !== "completed"),
			),
		);
	},

	// User role for current event
	getCurrentUserRole: () => {
		const currentGraphId = get().currentGraphId;
		if (!currentGraphId) return null;

		// Return cached role if available
		const userRole = get().userRolesByEventId[currentGraphId];
		return userRole || null;
	},

	// Role utility functions
	isAdmin: () => {
		const currentUserRole = get().getCurrentUserRole();
		return currentUserRole === EventAccessRole.ADMIN;
	},
	isOwner: () => {
		const currentUserRole = get().getCurrentUserRole();
		return currentUserRole === EventAccessRole.OWNER;
	},
	isAdminOrOwner: () => {
		const currentUserRole = get().getCurrentUserRole();
		return currentUserRole === EventAccessRole.ADMIN || currentUserRole === EventAccessRole.OWNER;
	},
	canEditSettings: () => {
		const currentUserRole = get().getCurrentUserRole();
		return currentUserRole === EventAccessRole.ADMIN || currentUserRole === EventAccessRole.OWNER;
	},
}));
