import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Views, View } from "react-big-calendar";
import { ViewMode } from "@/components/Schedule/gantt-task-react-main/src/types/public-types";
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
	activeProjectId: string | null;
	activeChatEntityId: string | null;
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
	setActiveProjectId: (id: string | null) => void;
	setActiveChatEntityId: (id: string | null) => void;
}

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
			activeProjectId: null,
			activeChatEntityId: null,
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
			setActiveProjectId: (id) => {
				if (typeof document !== "undefined") {
					if (id) {
						document.cookie = `activeProjectId=${id};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
					} else {
						document.cookie = "activeProjectId=;path=/;max-age=0";
					}
				}
				set(() => ({ activeProjectId: id }));
			},
			setActiveChatEntityId: (id) => set(() => ({ activeChatEntityId: id })),
		}),
		{
			name: "view-storage",
			storage: createJSONStorage(() => localStorage),
			merge: (persisted, current) => {
				const p = (persisted ?? {}) as Partial<ViewState>;
				const migrated = { ...current, ...p } as ViewState;
				if (p.preferredModelAgent == null) {
					migrated.preferredModelAgent = resolveModel(
						(p.preferredModel as string) ?? DEFAULT_MODEL_AGENT,
						"agent",
					);
				}
				if (p.preferredModelChat == null) {
					migrated.preferredModelChat = DEFAULT_MODEL_CHAT;
				}
				const agentType = (p.preferredAgentType ?? current.preferredAgentType) as "agent" | "chat";
				const stored = agentType === "agent" ? migrated.preferredModelAgent : migrated.preferredModelChat;
				migrated.preferredModel = resolveModel(stored, agentType);
				return migrated;
			},
		},
	),
);
