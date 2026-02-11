import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { scopeConfig } from "./projectconfig";
import { Chat, ChatMessage, ChatHistory } from "@/types/chat";
import { ProjectEntity } from "@/types/projects";
import { AgentChatEntity } from "@/types/agentChats";
import { ActivityEntity } from "@/types/activities";
import { State, SidePanelExtension, Brain, AppView } from "@/types/store";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MemberEntity } from "@/types/members";
import { ActivityEntityWithMembers } from "./mapOwnerToMembers";
import {
	UserUpdateCollectionType,
	NotificationInterface,
} from "@/types/updateCollection";
import { Views, View } from "react-big-calendar";
import { ViewMode } from "@/components/Schedule/gantt-task-react-main/src/types/public-types";
import { AgentChat } from "@/types/agentChats";
import {
	DEFAULT_MODEL_AGENT,
	DEFAULT_MODEL_CHAT,
	resolveModel,
} from "@/components/ChatInput/PlatformChat/PlatformChatInterface/types";

interface ViewState {
	workbenchView: "table" | "calendar";
	calendarSubView: "current" | "integrations";
	rowsPerPage: number;
	scheduleView: "list" | "gantt";
	calendarView: View;
	calendarDate: Date;
	ganttView: ViewMode;
	preferredModel: string;
	preferredModelAgent: string;
	preferredModelChat: string;
	preferredAgentType: "agent" | "chat";
	chatLayoutMode: "split" | "agent";
	setWorkbenchView: (view: "table" | "calendar") => void;
	setRowsPerPage: (rows: number) => void;
	setScheduleView: (view: "list" | "gantt") => void;
	setCalendarView: (view: View) => void;
	setCalendarDate: (date: Date) => void;
	setGanttView: (view: ViewMode) => void;
	setCalendarSubView: (view: "current" | "integrations") => void;
	setPreferredModel: (model: string) => void;
	setPreferredAgentType: (type: "agent" | "chat") => void;
	setChatLayoutMode: (mode: "split" | "agent") => void;
}

// Create new persisted store
export const useViewStore = create<ViewState>()(
	persist(
		(set, get) => ({
			workbenchView: "table",
			calendarSubView: "current",
			rowsPerPage: 10,
			scheduleView: "list",
			calendarView: Views.WEEK,
			calendarDate: new Date(),
			ganttView: ViewMode.Week,
			preferredModel: DEFAULT_MODEL_AGENT,
			preferredModelAgent: DEFAULT_MODEL_AGENT,
			preferredModelChat: DEFAULT_MODEL_CHAT,
			preferredAgentType: "agent",
			chatLayoutMode: "split",
			setWorkbenchView: (view) => set(() => ({ workbenchView: view })),
			setRowsPerPage: (rows) => set(() => ({ rowsPerPage: rows })),
			setScheduleView: (view) => set(() => ({ scheduleView: view })),
			setCalendarView: (view) => set(() => ({ calendarView: view })),
			setCalendarDate: (date) => set(() => ({ calendarDate: date })),
			setGanttView: (view) => set(() => ({ ganttView: view })),
			setCalendarSubView: (view) => set(() => ({ calendarSubView: view })),
			setPreferredModel: (model) =>
				set((s) => {
					const resolved = resolveModel(model, s.preferredAgentType);
					const updates: Partial<ViewState> = { preferredModel: resolved };
					if (s.preferredAgentType === "agent") {
						updates.preferredModelAgent = resolved;
					} else {
						updates.preferredModelChat = resolved;
					}
					return updates;
				}),
			setPreferredAgentType: (type) =>
				set((s) => {
					if (s.preferredAgentType === type) return {};
					const stored = type === "agent" ? s.preferredModelAgent : s.preferredModelChat;
					const resolved = resolveModel(stored, type);
					return {
						preferredAgentType: type,
						preferredModel: resolved,
						...(type === "agent" ? { preferredModelAgent: resolved } : { preferredModelChat: resolved }),
					};
				}),
			setChatLayoutMode: (mode) => set(() => ({ chatLayoutMode: mode })),
		}),
		{
			name: "view-storage",
			storage: createJSONStorage(() => localStorage),
			merge: (persisted, current) => {
				const p = (persisted ?? {}) as Partial<ViewState>;
				const migrated = { ...current, ...p } as ViewState;
				// Migration: old storage had preferredModel but not preferredModelAgent/preferredModelChat
				if (p.preferredModelAgent == null) {
					migrated.preferredModelAgent = resolveModel(
						(p.preferredModel as string) ?? DEFAULT_MODEL_AGENT,
						"agent",
					);
				}
				if (p.preferredModelChat == null) {
					migrated.preferredModelChat = DEFAULT_MODEL_CHAT;
				}
				// Ensure preferredModel is in sync with the active mode
				const agentType = (p.preferredAgentType ?? current.preferredAgentType) as "agent" | "chat";
				const stored = agentType === "agent" ? migrated.preferredModelAgent : migrated.preferredModelChat;
				migrated.preferredModel = resolveModel(stored, agentType);
				return migrated;
			},
		},
	),
);

export const useStore = create<State>()((set, get) => ({
	session: null,
	appView: "agent",
	hasHydrated: false,
	userProjects: [],
	refreshInterval: 10000,
	userActivities: [],
	activeProject: null,
	userUpdatesCollection: {},
	activeChatEntity: null,
	chatEntities: [],
	hasAdminRights: false,
	noteTitle: "",
	prompts: scopeConfig,
	sidePanelExtensionView: "memory",
	members: [],
	folderList: [],
	chatSession: null,
	chatSessions: [],
	chatMessages: [],
	selectedContext: null,
	pdfViewer: {
		isPdfVisible: false,
		pageNumber: 1,
		filePath: "",
		highlightDetails: undefined,
	},
	localChats: [],
	rightPanelView: "gantt",
	taskToView: null,
	taskDetailsView: "details",
	filterView: "none",
	scheduleProbability: 1.0,
	scheduleDate: new Date(),
	documentId: "",
	AiActionsView: "open",
	projectStatus: "On Schedule",
	unsavedChanges: {} as Record<string, boolean>,
	setSession: (session: Session | null) => set(() => ({ session })),
	// setNotification : (notification: NotificationInterface, projectId: string) => {
	//   const userUpdatesCollection = get().userUpdatesCollection;
	//   const projectUpdates = userUpdatesCollection[projectId] || [];
	//   userUpdatesCollection[projectId] = [...projectUpdates, notification];
	//   set(() => ({ userUpdatesCollection }));
	// },

	setAdminRights: (hasAdminRights: boolean) => set(() => ({ hasAdminRights })),
	setHasHydrated: (state) => {
		set({ hasHydrated: state });
	},
	setAppView: (appView: AppView) => set(() => ({ appView })),
	setRefreshInterval: (interval: number) =>
		set(() => ({ refreshInterval: interval })),
	setUserProjects: (userProjects: ProjectEntity[]) =>
		set(() => ({ userProjects })),
	setUserActivities: (userActivities: ActivityEntity[]) =>
		set(() => ({ userActivities })),
	setActiveProject: (activeProject: ProjectEntity | null) =>
		set(() => ({ activeProject })),
	setChatEntities: (chatEntities: AgentChatEntity[]) =>
		set(() => ({ chatEntities })),
	appendChatEntity: (chatEntity: AgentChatEntity) =>
		set((state) => ({
			chatEntities: [...state.chatEntities, chatEntity],
		})),
	setActiveChatEntity: (activeChatEntity: AgentChatEntity | null) =>
		set(() => ({ activeChatEntity })),
	setSidePanelExtensionView: (sidePanelExtensionView: SidePanelExtension) =>
		set((state) => ({
			sidePanelExtensionView:
        state.sidePanelExtensionView === sidePanelExtensionView
        	? null
        	: sidePanelExtensionView,
		})),
	setNoteTitle: (noteTitle: string) => set(() => ({ noteTitle })),
	setFolderList: (folderList: Brain[]) => set(() => ({ folderList })),
	setChatSession: (chatSession: Chat | null) => set(() => ({ chatSession })),
	setChatSessions: (chatSessions: Chat[]) => set(() => ({ chatSessions })),
	setChatMessages: (
		message: any,
		fromUser: "question" | "context" | "answer",
		id?: number,
	) =>
		set((state) => {
			if (id !== undefined) {
				const data = state.chatMessages.filter((resp) => resp.id !== id);
				return {
					chatMessages: [
						...data,
						{ id: id, message: message, fromUser: fromUser },
					],
				};
			} else {
				return {
					chatMessages: [
						...state.chatMessages,
						{
							id: state.chatMessages.length + 1,
							message: message,
							fromUser: fromUser,
						},
					],
				};
			}
		}),
	setMembers: (members: MemberEntity[]) => set(() => ({ members })),
	setChatHistory: (chatMessages: ChatMessage[]) => set({ chatMessages }),
	setSelectedContext: (selectedContext: Brain | null) =>
		set(() => ({ selectedContext })),
	setPdfViewer: (pdfDetails: any) =>
		set((state) => ({ pdfViewer: { ...state.pdfViewer, ...pdfDetails } })),

	updateChatHistory: (id: string, chatHistory: ChatHistory[]) =>
		set((state) => {
			// Find the index of the chat with the matching chat_id
			const chatSessions = state.chatSessions;

			const chatIndex = chatSessions.findIndex((chat) => chat.chat_id === id);

			if (chatIndex === -1) {
				// If the chat_id is not found in the list, you might want to handle this case.
				console.error("Chat ID not found!");
				return { chatSessions: chatSessions };
			}

			const chatToUpdate = chatSessions[chatIndex];

			// If chat_history exists, push the new session, otherwise, initialize it

			chatToUpdate.chat_history = chatHistory;

			// Replace the original chat with the updated one
			const updatedChatSessions = [
				...chatSessions.slice(0, chatIndex),
				chatToUpdate,
				...chatSessions.slice(chatIndex + 1),
			];

			return { chatSessions: updatedChatSessions };
		}),
	setRightPanelView: (view: "gantt" | "task") =>
		set(() => ({ rightPanelView: view })),
	setTaskToView: (task: ActivityEntity | ActivityEntityWithMembers | null) =>
		set(() => ({ taskToView: task })),
	setTaskDetailsView: (
		view: "details" | "history" | "impact" | "gantt" | "edit",
	) => set(() => ({ taskDetailsView: view })),
	setFilterView: (view: "none" | "Delayed" | "At Risk" | "In Progress" | any) =>
		set(() => ({ filterView: view })),
	setScheduleProbability: (probability: number) =>
		set(() => ({ scheduleProbability: probability })),
	setScheduleDate: (date: Date) => set(() => ({ scheduleDate: date })),
	setDocumentId: (id: string) => set(() => ({ documentId: id })),
	setAiActionsView: (view: "open" | "close" | "expand" | any) =>
		set(() => ({ AiActionsView: view })),
	setProjectStatus: (projectStatus: string) =>
		set(() => ({ projectStatus: projectStatus })),
	setLocalChats: (localChats: AgentChat[]) => set(() => ({ localChats })),
	setUnsavedChanges: (documentId: string, hasChanges: boolean) =>
		set((state) => ({
			unsavedChanges: {
				...state.unsavedChanges,
				[documentId]: hasChanges,
			},
		})),
	clearUnsavedChanges: (documentId: string) =>
		set((state) => {
			const { [documentId]: _, ...rest } = state.unsavedChanges;
			return { unsavedChanges: rest };
		}),
	clearAllUnsavedChanges: () => set(() => ({ unsavedChanges: {} })),
}));
