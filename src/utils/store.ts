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
import { useState, useEffect } from "react";
import { ActivityEntityWithMembers } from "./mapOwnerToMembers";
import {
  UserUpdateCollectionType,
  NotificationInterface,
} from "@/types/updateCollection";

export const useStoreHydrated = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, []);

  return data;
};

export const useStore = create<State>()(
  // persist(
  // immer(
  (set, get) => ({
    session: null,
    appView: "dashboard",
    hasHydrated: false,
    userProjects: [],
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
    rightPanelView: "gantt",
    taskToView: {
      id: "SCHEDULE",
      project_id: "parent",
      name: "Select a task",
      start: "01/01/23",
      end: "01/02/23",
      progress: 0,
      activity_critical: {
        critical_path: false,
      },
    },
    taskDetailsView: "details",
    filterView: "none",
    scheduleProbability: 1.0,
    scheduleDate: new Date(),
    documentId: "",
    AiActionsView: "open",
    projectStatus: "On Schedule",
    setSession: (session: Session | null) => set(() => ({ session })),
    // setNotification : (notification: NotificationInterface, projectId: string) => {
    //   const userUpdatesCollection = get().userUpdatesCollection;
    //   const projectUpdates = userUpdatesCollection[projectId] || [];
    //   userUpdatesCollection[projectId] = [...projectUpdates, notification];
    //   set(() => ({ userUpdatesCollection }));
    // },

    setAdminRights: (hasAdminRights: boolean) =>
      set(() => ({ hasAdminRights })),
    setHasHydrated: (state) => {
      set({ hasHydrated: state });
    },
    setAppView: (appView: AppView) => set(() => ({ appView })),
    setUserProjects: (userProjects: ProjectEntity[]) =>
      set(() => ({ userProjects })),
    setUserActivities: (userActivities: ActivityEntity[]) =>
      set(() => ({ userActivities })),
    setActiveProject: (activeProject: ProjectEntity | null) =>
      set(() => ({ activeProject })),
    setChatEntities: (chatEntities: AgentChatEntity[]) =>
      set(() => ({ chatEntities })),
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
    setTaskToView: (task: ActivityEntity | ActivityEntityWithMembers) =>
      set(() => ({ taskToView: task })),
    setTaskDetailsView: (
      view: "details" | "history" | "impact" | "gantt" | "edit"
    ) => set(() => ({ taskDetailsView: view })),
    setFilterView: (
      view: "none" | "Delayed" | "At Risk" | "In Progress" | any
    ) => set(() => ({ filterView: view })),
    setScheduleProbability: (probability: number) =>
      set(() => ({ scheduleProbability: probability })),
    setScheduleDate: (date: Date) => set(() => ({ scheduleDate: date })),
    setDocumentId: (id: string) => set(() => ({ documentId: id })),
    setAiActionsView: (view: "open" | "close" | "expand" | any) =>
      set(() => ({ AiActionsView: view })),
    setProjectStatus: (projectStatus: string) =>
      set(() => ({ projectStatus: projectStatus })),
  })
);
//     {
//       name: "globalStore",
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (state) =>
//         Object.fromEntries(
//           Object.entries(state).filter(
//             ([key]) => !["userActivities"].includes(key)
//           )
//         ),
//       skipHydration: true,
//       onRehydrateStorage: (state) => {
//         return (state, error) => {
//           if (error) {
//             console.error("Error rehydrating store", error);
//           }
//           if (state) {
//             state?.setHasHydrated(true);
//           }
//         };
//       },
//     }
//   )
// );
