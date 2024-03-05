import { Session } from "@supabase/supabase-js";
import { Chat, ChatMessage, ChatHistory } from "@/types/chat";
import { ProjectEntity } from "@/types/projects";
import { AgentChatEntity } from "@/types/agentChats";
import { ActivityEntity } from "@/types/activities";
import { MemberEntity } from "./members";

export type SidePanelExtension =
  | "fileExplorer"
  | "memory"
  | "agent"
  | "schedule"
  | "project"
  | null;

interface PdfViewer {
  isPdfVisible: boolean;
  pageNumber: number;
  filePath: string;
  highlightDetails: any;
}

export interface Brain {
  name: string;
  id?: string;
  rights: string;
  status: string;
}

export type AppView =
  | "schedule"
  | "search"
  | "agent"
  | "project"
  | "meeting"
  | "budget"
  | "communication"
  | "safety"
  | "dashboard"
  | "projectSettings"
  | "documentEditor"
  | "newLayout"
  | "notes"
  | "risks"
  | "updates"
  | "reports"
  | "scenarios"
  | "login"
  | "analysis"
  | "members"
  | "folders"
  | "changePassword";

export type State = {
  session: Session | null;
  appView: AppView;
  hasAdminRights: boolean;
  userProjects: ProjectEntity[];
  activeProject: ProjectEntity | null;
  userActivities: ActivityEntity[];
  activeChatEntity: AgentChatEntity;
  noteTitle: string;
  prompts: {
    scope: string;
    risks: string;
    getScopePrompt: string;
    generateScopePrompt: string;
  };
  members: MemberEntity[];
  sidePanelExtensionView: SidePanelExtension;
  folderList: Brain[] | null;
  chatSession: Chat | null;
  chatSessions: Chat[];
  chatMessages: ChatMessage[];
  selectedContext: Brain | null;
  pdfViewer: PdfViewer;
  rightPanelView: "gantt" | "task";
  taskToView: ActivityEntity;
  taskDetailsView: "details" | "history" | "impact" | "gantt" | "edit";
  filterView: "none" | "Delayed" | "At Risk" | "In Progress" | any;
  scheduleProbability: number;
  scheduleDate: Date;
  documentId: string;
  AiActionsView: "open" | "close" | "extend" | any;
  projectStatus: string;
  setSession: (session: Session | null) => void;
  setAppView: (appView: AppView) => void;
  setUserProjects: (userProjects: ProjectEntity[]) => void;
  setUserActivities: (userActivities: ActivityEntity[]) => void;
  setActiveProject: (activeProject: ProjectEntity | null) => void;
  setActiveChatEntity: (activeChatEntity: AgentChatEntity) => void;
  setAdminRights: (hasAdminRights: boolean) => void;
  setSidePanelExtensionView: (
    sidePanelExtensionView: SidePanelExtension
  ) => void;
  setNoteTitle: (notesTitle: string) => void;
  setFolderList: (folderList: Brain[]) => void;
  setChatSession: (chatSession: Chat | null) => void;
  setChatSessions: (chatSession: Chat[]) => void;
  setChatMessages: (
    message: any,
    fromUser: "question" | "context" | "answer",
    id?: number
  ) => void;
  setMembers: (members: MemberEntity[]) => void;
  setChatHistory: (chatMessages: ChatMessage[]) => void;
  setSelectedContext: (context: Brain | null) => void;
  setPdfViewer: (pdfDetails: any) => void;
  updateChatHistory: (id: string, chatHistory: ChatHistory[]) => void;
  setRightPanelView: (view: "gantt" | "task") => void;
  setTaskToView: (task: ActivityEntity) => void;
  setTaskDetailsView: (
    view: "details" | "history" | "impact" | "gantt" | "edit"
  ) => void;
  setFilterView: (
    view: "none" | "Delayed" | "At Risk" | "In Progress" | any
  ) => void;
  setScheduleProbability: (probability: number) => void;
  setScheduleDate: (date: Date) => void;
  setDocumentId: (id: string) => void;
  setAiActionsView: (view: "open" | "close" | "expand" | any) => void;
  setProjectStatus: (status: string) => void;
};
