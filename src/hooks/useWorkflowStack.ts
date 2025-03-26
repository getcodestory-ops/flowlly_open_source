import { create } from "zustand";
import { getEventsStatus } from "@/api/taskQueue";
import { Session } from "@supabase/supabase-js";


export enum WorkflowStatus {
  RUNNING = "running",
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "success",
  PAUSED = "paused",
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  message: string;
  requiresInput: boolean; 
  streamingKey?: string;
  isPollingEnabled: boolean;
  workflowId?: string;
}

interface WorkflowStatusResponse extends Partial<Workflow> {
	id: string;
	status: WorkflowStatus;
	message: string;
}

interface WorkflowStackStore {
	
  workflows: Record<string, Workflow>;
  pollingInterval: NodeJS.Timeout | null;
  addWorkflow: (workflow: Workflow, session: Session) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  updateWorkflowId: (oldId: string, newId: string) => void;
  startStatusPolling: (session: Session) => void;
  stopStatusPolling: () => void;
  getWorkflow: (id: string) => Workflow | undefined;
  updateWorkflowByCacheId: (cacheId: string, updates: Partial<Workflow>, session: Session) => void;
}

export const useWorkflowStack = create<WorkflowStackStore>((set, get) => ({
	workflows: {},
	pollingInterval: null,
  
	addWorkflow: (workflow, session) =>
		set((state) => {
			// If this is the first workflow, start polling
			if (Object.keys(state.workflows).length === 0) {
				get().startStatusPolling(session);
			}
			
			return {
				workflows: {
					...state.workflows,
					[workflow.id]: workflow, // Replace existing workflow if key is the same
				},
			};
		}),

	updateWorkflow: (id, updates) => {
		if (id in get().workflows) {
			set((state) => ({
				workflows: {
					...state.workflows,
					[id]: {
						...state.workflows[id],
						...updates,
					},
				},
			}));
		}
	},

	updateWorkflowId: (oldId, newId) => {
		if (oldId in get().workflows) {
			set((state) => {
				const workflow = state.workflows[oldId];
				const newWorkflows = { ...state.workflows };
				delete newWorkflows[oldId];
				return {
					workflows: {
						...newWorkflows,
						[newId]: {
							...workflow,
							id: newId,
						},
					},
				};
			});
		}
	},

	removeWorkflow: (id) =>
		set((state) => {
			const newWorkflows = { ...state.workflows };
			delete newWorkflows[id]; // Efficient deletion
			return { workflows: newWorkflows };
		}),

	startStatusPolling: (session: Session) => {
		// Clear any existing interval
		const currentInterval = get().pollingInterval;
		if (currentInterval) {
			clearInterval(currentInterval);
		}

		// Start polling every 5 seconds
		const interval = setInterval(async() => {
			const { workflows } = get();
			const activeWorkflows = Object.values(workflows).filter(
				(workflow) => workflow.status === WorkflowStatus.RUNNING || workflow.status === WorkflowStatus.PENDING,
			);

			if (activeWorkflows.length === 0) {
				// Stop polling if no active workflows
				get().stopStatusPolling();
				return;
			}

			try {
				const taskIds = activeWorkflows.map((workflow) => workflow.id);
				const statuses: Record<string, WorkflowStatusResponse> = await getEventsStatus({ session, taskIds });

				// Update workflow statuses and IDs
				taskIds.forEach((key: string) => {
					const status = statuses[key];
					const workflow = activeWorkflows.find((w) => w.id === key);
					if (workflow) {
						if (status.id && status.id !== workflow.id) {
							get().updateWorkflowId(workflow.id, status.id);
						}
						get().updateWorkflow(status.id ?? key, status);
					}
				});
			} catch (error) {
				console.error("Error fetching workflow statuses:", error);
			}
		}, 5000);

		set({ pollingInterval: interval });
	},

	stopStatusPolling: () => {
		const interval = get().pollingInterval;
		if (interval) {
			clearInterval(interval);
			set({ pollingInterval: null });
		}
	},
	getWorkflow: (id: string) => {
		return get().workflows[id];
	},	
	updateWorkflowByCacheId: (cacheId: string, updates: Partial<Workflow>, session: Session) => {
		set((state) => {
			const workflow = Object.values(state.workflows).find((w) => w.workflowId === cacheId);
			if (workflow) {
				// If the update includes an ID change, handle it separately
				if (updates.id && updates.id !== workflow.id) {
					const newWorkflows = { ...state.workflows };
					delete newWorkflows[workflow.id];
					return {
						workflows: {
							...newWorkflows,
							[updates.id]: {
								...workflow,
								...updates,
							},
						},
					};
				} else {
					return {
						workflows: {
							...state.workflows,
							[workflow.id]: {
								...workflow,
								...updates,
							},
						},
					};
				}
			}
			return state;
		});

		// Start polling if not already polling
		if (!get().pollingInterval) {
			get().startStatusPolling(session);
		}
	},
}));
