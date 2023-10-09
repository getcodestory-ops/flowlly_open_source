import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { scopeConfig } from "./projectconfig";
import { Chat, ChatMessage, ChatHistory } from "@/types/chat";

type SidePanelExtension =
  | "fileSystem"
  | "integrations"
  | "memory"
  | "assistant"
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

type State = {
  session: Session | null;
  appView: "assistant" | "search";
  hasAdminRights: boolean;
  prompts: {
    scope: string;
    risks: string;
    getScopePrompt: string;
    generateScopePrompt: string;
  };
  sidePanelExtensionView: SidePanelExtension;
  folderList: Brain[] | null;
  chatSession: Chat | null;
  chatSessions: Chat[];
  chatMessages: ChatMessage[];
  selectedContext: Brain | null;
  pdfViewer: PdfViewer;
  setSession: (session: Session | null) => void;
  setAppView: (appView: "assistant" | "search") => void;
  setAdminRights: (hasAdminRights: boolean) => void;
  setSidePanelExtensionView: (
    sidePanelExtensionView: SidePanelExtension
  ) => void;
  setFolderList: (folderList: Brain[]) => void;
  setChatSession: (chatSession: Chat | null) => void;
  setChatSessions: (chatSession: Chat[]) => void;
  setChatMessages: (
    message: any,
    fromUser: "question" | "context" | "answer",
    id?: number
  ) => void;
  setChatHistory: (chatMessages: ChatMessage[]) => void;
  setSelectedContext: (context: Brain | null) => void;
  setPdfViewer: (pdfDetails: any) => void;
  updateChatHistory: (id: string, chatHistory: ChatHistory[]) => void;
};

export const useStore = create<State>((set) => ({
  session: null,
  appView: "assistant",
  hasAdminRights: false,
  prompts: scopeConfig,
  sidePanelExtensionView: "assistant",
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
  setSession: (session: Session | null) => set(() => ({ session })),
  setAdminRights: (hasAdminRights: boolean) => set(() => ({ hasAdminRights })),
  setAppView: (appView: "assistant" | "search") => set(() => ({ appView })),
  setSidePanelExtensionView: (sidePanelExtensionView: SidePanelExtension) =>
    set((state) => ({
      sidePanelExtensionView:
        state.sidePanelExtensionView === sidePanelExtensionView
          ? null
          : sidePanelExtensionView,
    })),
  setFolderList: (folderList: Brain[]) => set(() => ({ folderList })),
  setChatSession: (chatSession: Chat | null) => set(() => ({ chatSession })),
  setChatSessions: (chatSessions: Chat[]) => set(() => ({ chatSessions })),
  setChatMessages: (
    message: any,
    fromUser: "question" | "context" | "answer",
    id?: number
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
      chatSessions[chatIndex] = chatToUpdate;

      return { chatSessions: chatSessions };
    }),
}));
