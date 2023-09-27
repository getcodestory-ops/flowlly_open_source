import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { scopeConfig } from './projectconfig';

type SidePanelExtension =  "fileSystem"| "integrations"| "memory"| "assistant"| null;

type State = {
  session: Session | null;
  appView: "assistant" | "search";
  hasAdminRights: boolean;
  prompts : {scope: string, risks: string, getScopePrompt: string, generateScopePrompt: string};
  sidePanelExtensionView:   SidePanelExtension,
  folderList: { name: string }[] | null;
  setSession: (session: Session | null) => void;
  setAppView: (appView: "assistant" | "search") => void;
  setAdminRights: (hasAdminRights: boolean) => void;
  setSidePanelExtensionView: (sidePanelExtensionView: SidePanelExtension)=> void;
  setFolderList: (folderList:  { name: string }[] | null) => void;

};

export const useStore = create<State>((set) => ({
  session: null,
  appView: "assistant",
  hasAdminRights: false,
  prompts: scopeConfig,
  sidePanelExtensionView: "assistant",
  folderList: [],
  setSession: (session: Session | null) => set(() => ({ session })),
  setAdminRights: (hasAdminRights: boolean) => set(() => ({ hasAdminRights })),
  setAppView: (appView: "assistant" | "search") => set(()=>({appView})),
  setSidePanelExtensionView: (sidePanelExtensionView: SidePanelExtension) => set((state) =>(
  { sidePanelExtensionView: state.sidePanelExtensionView === sidePanelExtensionView? null : sidePanelExtensionView} )),
  setFolderList: (folderList)=> set(()=>({folderList}))
}));

