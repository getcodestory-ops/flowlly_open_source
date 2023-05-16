import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { scopeConfig } from './projectconfig';

type State = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  prompts : {scope: string, risks: string, getScopePrompt: string, generateScopePrompt: string}
};

export const useStore = create<State>((set) => ({
  session: null,
  setSession: (session: Session | null) => set(() => ({ session })),
  prompts: scopeConfig
}));

