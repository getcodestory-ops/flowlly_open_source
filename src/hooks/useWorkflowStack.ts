import { create } from "zustand";

export enum WorkflowStatus {
  RUNNING = "running",
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "success",
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  requiresInput: boolean; // If true, shows the call-to-action button
}

interface WorkflowStackStore {
  workflows: Record<string, Workflow>;
  addWorkflow: (_: Workflow) => void;
  updateWorkflowStatus: (id: string, status: WorkflowStatus) => void;
  removeWorkflow: (id: string) => void;
}

export const useWorkflowStack = create<WorkflowStackStore>((set, get) => ({
	workflows: {},
  
	addWorkflow: (workflow) =>
		set((state) => ({
			workflows: {
				...state.workflows,
				[workflow.id]: workflow, // Replace existing workflow if key is the same
			},
		})),

	updateWorkflowStatus: (id, status) => {
		if (id in get().workflows) {
			set((state) => ({
				workflows: {
					...state.workflows,
					[id]: {
						...state.workflows[id],
						status,
					},
				},
			}));
		}
	},


	removeWorkflow: (id) =>
		set((state) => {
			const newWorkflows = { ...state.workflows };
			delete newWorkflows[id]; // Efficient deletion
			return { workflows: newWorkflows };
		}),
}));
