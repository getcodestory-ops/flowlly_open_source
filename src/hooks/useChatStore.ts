import { create } from "zustand";

interface ChatStore {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
    sidePanel: {
        isOpen: boolean;
        type: "sources" | "editor" | "pdfViewer" | "log";
        resourceId: string;
        filename?: string;
    } | null;
    setSidePanel: (sidePanel: {
        isOpen: boolean;
        type: "sources" | "editor" | "pdfViewer" | "log";
        resourceId: string;
        filename?: string;
    } | null) => void;
	documentDisplayMap: { [resourceId: string]: string };
	setDocumentDisplayMap: (resourceId: string, chatId: string) => void;
	clearDocumentDisplayMap: () => void;
	selectedContexts: {
		[chatId: string]: {
			id: string;
			name: string;
			extension: string;
		}[];
	};
	setSelectedContexts: (chatId: string, contexts: {
		id: string;
		name: string;
		extension: string;
	}[]) => void;
	replaceUntitledChatId: (newChatId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
	collapsed: false,
	setCollapsed: (collapsed) => set({ collapsed }),
	sidePanel: {
		isOpen: false,
		type: "sources",
		resourceId: "",
		filename: "",
	},
	setSidePanel: (sidePanel) => set({ sidePanel }),
	documentDisplayMap: {},
	setDocumentDisplayMap: (resourceId, chatId) => 
		set((state) => ({
			documentDisplayMap: {
				...state.documentDisplayMap,
				[resourceId]: chatId,
			},
		})),
	clearDocumentDisplayMap: () => set({ documentDisplayMap: {} }),
	selectedContexts: {},
	setSelectedContexts: (chatId, contexts) => 
		set((state) => ({
			selectedContexts: {
				...state.selectedContexts,
				[chatId]: contexts,
			},
		})),
	replaceUntitledChatId: (newChatId: string) => set((state) => {
		const untitledContexts = state.selectedContexts["untitled"];
		if (!untitledContexts) return state;

		const { ["untitled"]: _, ...restContexts } = state.selectedContexts;
		return {
			selectedContexts: {
				...restContexts,
				[newChatId]: untitledContexts,
			},
		};
	}),
}));


