import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { ProjectEntity, ChatEntity, ChatMessage } from "../types/project";

interface StoreState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  activeProject: ProjectEntity | null;
  setActiveProject: (project: ProjectEntity | null) => void;
  activeChatEntity: ChatEntity | null;
  setActiveChatEntity: (chat: ChatEntity | null) => void;
  chatEntities: ChatEntity[];
  setChatEntities: (chats: ChatEntity[]) => void;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  activeChatEntity: null,
  setActiveChatEntity: (chat) => set({ activeChatEntity: chat }),
  chatEntities: [],
  setChatEntities: (chats) => set({ chatEntities: chats }),
  messages: [],
  setMessages: (messages) => set({ messages: messages }),
}));
